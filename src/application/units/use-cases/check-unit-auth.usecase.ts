import { UnitEntity } from '@application/units/entities/unit-entity';
import { FindOneUnitUseCase } from '@application/units/use-cases/find-one-unit.usecase';
import { ApplicationError } from '@common/errors/application.error';
import type { Logger } from '@common/logging/logger';
import { LOGGER } from '@common/logging/logger.token';
import { Inject, Injectable } from '@nestjs/common';

@Injectable()
export class CheckUnitAuthUseCase {
  constructor(
    @Inject(LOGGER) private readonly logger: Logger,
    private readonly findOneUnitUseCase: FindOneUnitUseCase,
  ) {}

  async execute(unitId: string, userId: string): Promise<void> {
    const unit = await this.findOneUnitUseCase.execute({ id: unitId });

    this.assertOwner(unit, userId);
  }

  assertOwner(unit: UnitEntity, userId: string): void {
    if (unit.user !== userId) {
      this.logger.warn('Unit access denied', {
        unitId: unit.id,
        userId,
      });

      throw new ApplicationError('UNIT_ACCESS_DENIED');
    }
  }
}
