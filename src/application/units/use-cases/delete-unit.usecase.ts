import { UNIT_REPOSITORY } from '@application/units/repositories/unit-repository.token';
import type { UnitRepository } from '@application/units/repositories/unit.repository';
import { CheckUnitAuthUseCase } from '@application/units/use-cases/check-unit-auth.usecase';
import { ApplicationError } from '@common/errors/application.error';
import type { Logger } from '@common/logging/logger';
import { LOGGER } from '@common/logging/logger.token';
import { Inject, Injectable } from '@nestjs/common';

@Injectable()
export class DeleteUnitUseCase {
  constructor(
    @Inject(UNIT_REPOSITORY) private readonly unitRepository: UnitRepository,
    private readonly checkUnitAuthUseCase: CheckUnitAuthUseCase,
    @Inject(LOGGER) private readonly logger: Logger,
  ) {}
  async execute(id: string, userId: string): Promise<void> {
    await this.checkUnitAuthUseCase.execute(id, userId);

    const deleted = await this.unitRepository.delete(id);

    if (!deleted) {
      this.logger.warn('Unit no longer available for delete', { unitId: id, userId });
      throw new ApplicationError('UNIT_NOT_FOUND');
    }

    this.logger.info('Unit deleted', { unitId: id, userId });
  }
}
