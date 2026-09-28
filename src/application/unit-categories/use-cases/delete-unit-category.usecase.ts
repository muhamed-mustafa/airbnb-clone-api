import type { Logger } from '@common/logging/logger';
import { LOGGER } from '@common/logging/logger.token';
import { Inject, Injectable } from '@nestjs/common';
import { ApplicationError } from '@common/errors/application.error';
import { UNIT_CATEGORY_REPOSITORY } from '../repositories/unit-category-repository.token';
import type { UnitCategoryRepository } from '../repositories/unit-category.repository';

@Injectable()
export class DeleteUnitCategoryUseCase {
  constructor(
    @Inject(UNIT_CATEGORY_REPOSITORY)
    private readonly unitCategoryRepository: UnitCategoryRepository,
    @Inject(LOGGER)
    private readonly logger: Logger,
  ) {}

  async execute(id: string): Promise<void> {
    const deleted = await this.unitCategoryRepository.delete(id);

    if (!deleted) {
      this.logger.warn('Unit category not found for deletion', { unitCategoryId: id });
      throw new ApplicationError('UNIT_CATEGORY_NOT_FOUND');
    }

    this.logger.info('Unit category deleted', { unitCategoryId: id });
  }
}
