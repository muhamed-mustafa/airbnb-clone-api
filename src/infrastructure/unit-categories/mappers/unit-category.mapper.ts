import type { HydratedDocument } from 'mongoose';
import type { UnitCategoryEntity } from '../../../application/unit-categories/entities/unit-category.entity';
import type { UnitCategory } from '../schemas/unit-categories.schema';

export class UnitCategoryMapper {
  static toEntity(unitCategory: HydratedDocument<UnitCategory>): UnitCategoryEntity {
    return {
      id: unitCategory._id.toString(),
      name: unitCategory.name,
      icon: unitCategory.icon ?? '',
    };
  }
}
