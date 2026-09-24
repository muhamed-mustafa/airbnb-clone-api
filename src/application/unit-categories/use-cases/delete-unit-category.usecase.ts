import { Inject, Injectable } from '@nestjs/common';
import { ApplicationError } from '@common/errors/application.error';
import { UNIT_CATEGORY_REPOSITORY } from '../repositories/unit-category-repository.token';
import type { UnitCategoryRepository } from '../repositories/unit-category.repository';

@Injectable()
export class DeleteUnitCategoryUseCase {
  constructor(
    @Inject(UNIT_CATEGORY_REPOSITORY)
    private readonly unitCategoryRepository: UnitCategoryRepository,
  ) {}

  async execute(id: string): Promise<void> {
    const deleted = await this.unitCategoryRepository.delete(id);

    if (!deleted) {
      throw new ApplicationError('UNIT_CATEGORY_NOT_FOUND');
    }
  }
}
