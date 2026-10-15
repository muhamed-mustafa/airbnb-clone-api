import { UnitEntity } from '@application/units/entities/unit-entity';
import { UpdateUnitInput } from '@application/units/inputs/update-unit.input';
import { UNIT_REPOSITORY } from '@application/units/repositories/unit-repository.token';
import type { UnitRepository } from '@application/units/repositories/unit.repository';
import { CheckUnitAuthUseCase } from '@application/units/use-cases/check-unit-auth.usecase';
import { FindOneUnitUseCase } from '@application/units/use-cases/find-one-unit.usecase';
import { UnitValidationUseCase } from '@application/units/use-cases/unit-validation.usecase';
import { ApplicationError } from '@common/errors/application.error';
import type { Logger } from '@common/logging/logger';
import { LOGGER } from '@common/logging/logger.token';
import { Inject, Injectable } from '@nestjs/common';

@Injectable()
export class UpdateUnitUseCase {
  constructor(
    @Inject(UNIT_REPOSITORY) private readonly unitRepository: UnitRepository,
    private readonly findOneUnitUseCase: FindOneUnitUseCase,
    private readonly unitValidationUseCase: UnitValidationUseCase,
    private readonly unitAccessControlUseCase: CheckUnitAuthUseCase,
    @Inject(LOGGER) private readonly logger: Logger,
  ) {}

  async execute(id: string, data: UpdateUnitInput, userId: string): Promise<UnitEntity> {
    const unit = await this.findOneUnitUseCase.execute({ id });

    await this.unitAccessControlUseCase.execute(unit?.id, userId);

    await this.unitValidationUseCase.execute(data, unit.country, unit.city);

    const updated = await this.unitRepository.update(id, data);

    if (!updated) {
      this.logger.warn('Unit no longer available for update', { unitId: id });
      throw new ApplicationError('UNIT_NOT_FOUND');
    }

    this.logger.info('Unit updated', { unitId: id, userId });

    return updated;
  }
}
