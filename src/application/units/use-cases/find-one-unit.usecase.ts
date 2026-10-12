import { UnitEntity } from '@application/units/entities/unit-entity';
import { UNIT_REPOSITORY } from '@application/units/repositories/unit-repository.token';
import type { UnitRepository } from '@application/units/repositories/unit.repository';
import { ApplicationError } from '@common/errors/application.error';
import { Inject, Injectable } from '@nestjs/common';

@Injectable()
export class FindOneUnitUseCase {
  constructor(@Inject(UNIT_REPOSITORY) private readonly unitRepository: UnitRepository) {}

  async execute(query: Partial<UnitEntity>): Promise<UnitEntity | null> {
    const unit = await this.unitRepository.findOne(query);

    if (!unit) {
      throw new ApplicationError('UNIT_NOT_FOUND');
    }

    return unit;
  }
}
