import { Inject, Injectable } from '@nestjs/common';
import { ApplicationError } from '../../../common/errors/application.error';
import { UnitCategoryEntity } from '../entities/unit-category.entity';
import { UNIT_CATEGORY_REPOSITORY } from '../repositories/unit-category-repository.token';
import type { UnitCategoryRepository } from '../repositories/unit-category.repository';

@Injectable()
export class FindUnitCategoryByIdUseCase {
  constructor(
    @Inject(UNIT_CATEGORY_REPOSITORY)
    private readonly unitCategoryRepository: UnitCategoryRepository,
  ) {}

  async execute(id: string): Promise<UnitCategoryEntity> {
    const unitCategory = await this.unitCategoryRepository.findById(id);

    if (!unitCategory) {
      throw new ApplicationError('UNIT_CATEGORY_NOT_FOUND');
    }

    return unitCategory;
  }
}
