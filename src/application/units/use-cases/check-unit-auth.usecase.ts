import { UNIT_REPOSITORY } from '@application/units/repositories/unit-repository.token';
import type { UnitRepository } from '@application/units/repositories/unit.repository';
import { ApplicationError } from '@common/errors/application.error';
import { Inject, Injectable } from '@nestjs/common';

@Injectable()
export class CheckUnitAuthUseCase {
  constructor(@Inject(UNIT_REPOSITORY) private readonly unitRepository: UnitRepository) {}

  async execute(unitId: string, userId: string): Promise<void> {
    const unit = await this.unitRepository.findOne({ id: unitId });

    if (unit?.user !== userId) {
      throw new ApplicationError('UNIT_ACCESS_DENIED');
    }
  }
}
