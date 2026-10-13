import type { Logger } from '@common/logging/logger';
import { LOGGER } from '@common/logging/logger.token';
import { UnitEntity } from '@application/units/entities/unit-entity';
import { UNIT_REPOSITORY } from '@application/units/repositories/unit-repository.token';
import type { UnitRepository } from '@application/units/repositories/unit.repository';
import { ApplicationError } from '@common/errors/application.error';
import { Inject, Injectable } from '@nestjs/common';

@Injectable()
export class FindOneUnitUseCase {
  constructor(
    @Inject(UNIT_REPOSITORY) private readonly unitRepository: UnitRepository,
    @Inject(LOGGER) private readonly logger: Logger,
  ) {}

  async execute(query: Partial<UnitEntity>): Promise<UnitEntity> {
    const unit = await this.unitRepository.findOne(query);

    if (!unit) {
      this.logger.debug('Unit not found', { unitId: query.id });
      throw new ApplicationError('UNIT_NOT_FOUND');
    }

    this.logger.debug('Unit retrieved', { unitId: unit.id });
    return unit;
  }
}
