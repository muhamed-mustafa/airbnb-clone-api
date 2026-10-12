import { UnitEntity } from '@application/units/entities/unit-entity';
import { CreateUnitInput } from '@application/units/inputs/create-unit.input';
import { CreateUnitUseCase } from '@application/units/use-cases/create-unit.usecase';
import { FindOneUnitUseCase } from '@application/units/use-cases/find-one-unit.usecase';
import { UpdateUnitUseCase } from '@application/units/use-cases/update-unit.usecase';
import { Injectable } from '@nestjs/common';

@Injectable()
export class UnitService {
  constructor(
    private readonly createUnitUseCase: CreateUnitUseCase,
    private readonly findOneUnitUseCase: FindOneUnitUseCase,
    private readonly updateUnitUseCase: UpdateUnitUseCase,
  ) {}

  async create(data: CreateUnitInput): Promise<UnitEntity> {
    return await this.createUnitUseCase.execute(data, data.user);
  }

  async findOne(query: Partial<UnitEntity>): Promise<UnitEntity | null> {
    return await this.findOneUnitUseCase.execute(query);
  }

  async update(id: string, data: Partial<UnitEntity>, userId: string): Promise<UnitEntity | null> {
    return await this.updateUnitUseCase.execute(id, data, userId);
  }
}
