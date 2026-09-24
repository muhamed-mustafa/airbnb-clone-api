import type { UnitCategoryEntity } from '../../../application/unit-categories/entities/unit-category.entity';
import type { CreateUnitCategoryInput } from '../../../application/unit-categories/inputs/create-unit-category.input';
import { UnitCategoryResponseDto } from '../dtos/unit-category-response.dto';
import { CreateUnitCategoryDto } from '../dtos/create-unit-category.dto';

export class UnitCategoryMapper {
  static toUnitCategoryInput(unitCategory: CreateUnitCategoryDto): CreateUnitCategoryInput {
    return {
      name: unitCategory.name,
      icon: unitCategory.icon,
    };
  }

  static toResponse(unitCategory: UnitCategoryEntity): UnitCategoryResponseDto {
    return {
      id: unitCategory.id,
      name: unitCategory.name,
      icon: unitCategory.icon,
    };
  }
}
