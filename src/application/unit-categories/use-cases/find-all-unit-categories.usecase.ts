import type { Logger } from '@common/logging/logger';
import { LOGGER } from '@common/logging/logger.token';
import { Inject, Injectable } from '@nestjs/common';
import { PaginatedResult } from '../../../common/pagination/pagination.types';
import { createPaginationMeta } from '../../../common/pagination/pagination.utils';
import { UnitCategoryEntity } from '../entities/unit-category.entity';
import { UnitCategoryFilter } from '../repositories/unit-category-filter';
import { UNIT_CATEGORY_REPOSITORY } from '../repositories/unit-category-repository.token';
import type { UnitCategoryRepository } from '../repositories/unit-category.repository';

@Injectable()
export class FindAllUnitCategoriesUseCase {
  constructor(
    @Inject(UNIT_CATEGORY_REPOSITORY)
    private readonly unitCategoryRepository: UnitCategoryRepository,
    @Inject(LOGGER)
    private readonly logger: Logger,
  ) {}

  async execute(filter: UnitCategoryFilter = {}): Promise<PaginatedResult<UnitCategoryEntity>> {
    const { page = 1, limit = 10 } = filter;

    const { items, total } = await this.unitCategoryRepository.find(filter);

    this.logger.debug('Unit categories listed', { page, limit, total });

    return {
      data: items,
      meta: createPaginationMeta(page, limit, total),
    };
  }
}
