import type { Logger } from '@common/logging/logger';
import { LOGGER } from '@common/logging/logger.token';
import { UnitEntity } from '@application/units/entities/unit-entity';
import { CreateUnitInput } from '@application/units/inputs/create-unit.input';
import { UNIT_REPOSITORY } from '@application/units/repositories/unit-repository.token';
import type { UnitRepository } from '@application/units/repositories/unit.repository';
import { UnitValidationUseCase } from '@application/units/use-cases/unit-validation.usecase';
import { Inject, Injectable } from '@nestjs/common';

@Injectable()
export class CreateUnitUseCase {
  constructor(
    @Inject(UNIT_REPOSITORY)
    private readonly unitRepository: UnitRepository,
    private readonly unitValidationUseCase: UnitValidationUseCase,
    @Inject(LOGGER) private readonly logger: Logger,
  ) {}

  async execute(data: CreateUnitInput, userId: string): Promise<UnitEntity> {
    await this.unitValidationUseCase.execute(data);
    const unit = await this.unitRepository.create({ ...data, user: userId });
    this.logger.info('Unit created', { unitId: unit.id, userId });
    return unit;
  }
}
