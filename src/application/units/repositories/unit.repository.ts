import { UnitEntity } from '@application/units/entities/unit-entity';
import { CreateUnitInput } from '@application/units/inputs/create-unit.input';
import { UpdateUnitInput } from '@application/units/inputs/update-unit.input';
import { UnitFilter } from '@application/units/repositories/unit-filter';

export interface UnitRepository {
  create(unit: CreateUnitInput): Promise<UnitEntity>;
  findOne(query: Partial<UnitEntity>): Promise<UnitEntity | null>;
  update(id: string, unit: UpdateUnitInput): Promise<UnitEntity | null>;
  find(filter: UnitFilter): Promise<{ items: UnitEntity[]; total: number }>;
}
