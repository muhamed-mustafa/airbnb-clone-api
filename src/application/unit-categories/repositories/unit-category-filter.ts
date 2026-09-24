import { UnitCategoryEntity } from '../entities/unit-category.entity';

export type UnitCategoryFilter = Partial<Pick<UnitCategoryEntity, 'name'>> & {
  isDeleted?: boolean;
  page?: number;
  limit?: number;
};
