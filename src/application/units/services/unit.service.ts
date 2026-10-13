import { UnitEntity } from '@application/units/entities/unit-entity';
import { CreateUnitInput } from '@application/units/inputs/create-unit.input';
import { UnitFilter } from '@application/units/repositories/unit-filter';
import { CreateUnitUseCase } from '@application/units/use-cases/create-unit.usecase';
import { FindAllUnitsUseCase } from '@application/units/use-cases/find-all.usecase';
import { FindAllMyUnitsUseCase } from '@application/units/use-cases/find-my-units.usecase';
import { FindOneUnitUseCase } from '@application/units/use-cases/find-one-unit.usecase';
import { UpdateUnitUseCase } from '@application/units/use-cases/update-unit.usecase';
import { PaginatedResult } from '@common/pagination/pagination.types';
import { Injectable } from '@nestjs/common';

@Injectable()
export class UnitService {
  constructor(
    private readonly createUnitUseCase: CreateUnitUseCase,
    private readonly findAllUnitsUseCase: FindAllUnitsUseCase,
    private readonly findMyUnitsUseCase: FindAllMyUnitsUseCase,
    private readonly findOneUnitUseCase: FindOneUnitUseCase,
    private readonly updateUnitUseCase: UpdateUnitUseCase,
  ) {}

  async create(data: CreateUnitInput): Promise<UnitEntity> {
    return await this.createUnitUseCase.execute(data, data.user);
  }

  async findAll(query: UnitFilter = {}): Promise<PaginatedResult<UnitEntity>> {
    return await this.findAllUnitsUseCase.execute(query);
  }

  async findMyUnits(userId: string, query: UnitFilter = {}): Promise<PaginatedResult<UnitEntity>> {
    return await this.findMyUnitsUseCase.execute(userId, query);
  }

  async findOne(query: Partial<UnitEntity>): Promise<UnitEntity | null> {
    return await this.findOneUnitUseCase.execute(query);
  }

  async update(id: string, data: Partial<UnitEntity>, userId: string): Promise<UnitEntity | null> {
    return await this.updateUnitUseCase.execute(id, data, userId);
  }
}
