import { UpdateUnitInput } from '@application/units/inputs/update-unit.input';
import { ActivateUnitUseCase } from '@application/units/use-cases/activate-unit.usecase';
import { DeactivateUnitUseCase } from '@application/units/use-cases/deactivate-unit.usecase';
import { DeleteUnitUseCase } from '@application/units/use-cases/delete-unit.usecase';
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
    private readonly activateUnitUseCase: ActivateUnitUseCase,
    private readonly deactivateUnitUseCase: DeactivateUnitUseCase,
    private readonly deleteUnitUseCase: DeleteUnitUseCase,
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

  async update(id: string, data: UpdateUnitInput, userId: string): Promise<UnitEntity> {
    return await this.updateUnitUseCase.execute(id, data, userId);
  }
  async activate(id: string, userId: string): Promise<UnitEntity> {
    return this.activateUnitUseCase.execute(id, userId);
  }

  async deactivate(id: string, userId: string): Promise<UnitEntity> {
    return this.deactivateUnitUseCase.execute(id, userId);
  }

  async delete(id: string, userId: string): Promise<void> {
    return this.deleteUnitUseCase.execute(id, userId);
  }
}
