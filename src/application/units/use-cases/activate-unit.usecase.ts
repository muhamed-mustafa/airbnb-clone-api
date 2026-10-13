import { UnitEntity } from '@application/units/entities/unit-entity';
import { UNIT_REPOSITORY } from '@application/units/repositories/unit-repository.token';
import type { UnitRepository } from '@application/units/repositories/unit.repository';
import { CheckUnitAuthUseCase } from '@application/units/use-cases/check-unit-auth.usecase';
import { ApplicationError } from '@common/errors/application.error';
import type { Logger } from '@common/logging/logger';
import { LOGGER } from '@common/logging/logger.token';
import { Inject, Injectable } from '@nestjs/common';

@Injectable()
export class ActivateUnitUseCase {
  constructor(
    @Inject(UNIT_REPOSITORY) private readonly unitRepository: UnitRepository,
    private readonly checkUnitAuthUseCase: CheckUnitAuthUseCase,
    @Inject(LOGGER) private readonly logger: Logger,
  ) {}
  async execute(id: string, userId: string): Promise<UnitEntity> {
    await this.checkUnitAuthUseCase.execute(id, userId);

    const unit = await this.unitRepository.activate(id);

    if (!unit) {
      this.logger.warn('Unit no longer available for activate', { unitId: id, userId });
      throw new ApplicationError('UNIT_NOT_FOUND');
    }

    this.logger.info('Unit activated', { unitId: id, userId });

    return unit;
  }
}
