import { UnitCategoryEntity } from '../entities/unit-category.entity';
import { CreateUnitCategoryInput } from '../inputs/create-unit-category.input';
import { UpdateUnitCategoryInput } from '../inputs/update-unit-category.input';
import { UnitCategoryFilter } from './unit-category-filter';

export interface UnitCategoryRepository {
  create(unitCategory: CreateUnitCategoryInput): Promise<UnitCategoryEntity>;
  existsByName(name: string): Promise<boolean>;
  find(filter: UnitCategoryFilter): Promise<{ items: UnitCategoryEntity[]; total: number }>;
  findById(id: string): Promise<UnitCategoryEntity | null>;
  update(id: string, unitCategory: UpdateUnitCategoryInput): Promise<UnitCategoryEntity | null>;
  delete(id: string): Promise<boolean>;
}
