import { UnitEntity } from '@application/units/entities/unit-entity';
import { CreateUnitInput } from '@application/units/inputs/create-unit.input';
import { UpdateUnitInput } from '@application/units/inputs/update-unit.input';
import { UnitFilter } from '@application/units/repositories/unit-filter';
import type { TransactionSession } from '@common/transactions/transaction-runner';

export interface UnitRepository {
  create(unit: CreateUnitInput, session?: TransactionSession): Promise<UnitEntity>;
  findOne(query: Partial<UnitEntity>, session?: TransactionSession): Promise<UnitEntity | null>;
  update(
    id: string,
    unit: UpdateUnitInput,
    session?: TransactionSession,
  ): Promise<UnitEntity | null>;
  activate(id: string, expectedVersion: number): Promise<UnitEntity | null>;
  deactivate(id: string, expectedVersion: number): Promise<UnitEntity | null>;
  delete(id: string, expectedVersion: number): Promise<boolean>;
  find(filter: UnitFilter): Promise<{ items: UnitEntity[]; total: number }>;
  findReferencedPhotos(
    urls: string[],
    excludeUnitId?: string,
    session?: TransactionSession,
  ): Promise<string[]>;
}
