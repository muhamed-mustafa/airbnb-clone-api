import { UnitEntity } from '@application/units/entities/unit-entity';
import { CreateUnitInput } from '@application/units/inputs/create-unit.input';

export interface UnitRepository {
  create(unit: CreateUnitInput): Promise<UnitEntity>;
}
