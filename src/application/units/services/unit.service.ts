import { UnitEntity } from '@application/units/entities/unit-entity';
import { CreateUnitInput } from '@application/units/inputs/create-unit.input';
import { CreateUnitUseCase } from '@application/units/use-cases/create-unit.usecase';
import { Injectable } from '@nestjs/common';

@Injectable()
export class UnitService {
  constructor(private readonly createUnitUseCase: CreateUnitUseCase) {}

  async create(data: CreateUnitInput): Promise<UnitEntity> {
    return await this.createUnitUseCase.execute(data, data.user);
  }
}
