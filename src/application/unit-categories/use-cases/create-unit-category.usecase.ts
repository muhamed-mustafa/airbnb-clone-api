import { Inject, Injectable } from '@nestjs/common';
import { ApplicationError } from '../../../common/errors/application.error';
import { UnitCategoryEntity } from '../entities/unit-category.entity';
import { CreateUnitCategoryInput } from '../inputs/create-unit-category.input';
import { UNIT_CATEGORY_REPOSITORY } from '../repositories/unit-category-repository.token';
import type { UnitCategoryRepository } from '../repositories/unit-category.repository';

@Injectable()
export class CreateUnitCategoryUseCase {
  constructor(
    @Inject(UNIT_CATEGORY_REPOSITORY)
    private readonly unitCategoryRepository: UnitCategoryRepository,
  ) {}

  async execute(data: CreateUnitCategoryInput): Promise<UnitCategoryEntity> {
    const exists = await this.unitCategoryRepository.existsByName(data.name);

    if (exists) {
      throw new ApplicationError('UNIT_CATEGORY_ALREADY_EXISTS');
    }

    return this.unitCategoryRepository.create(data);
  }
}
