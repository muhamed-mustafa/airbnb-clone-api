import type { Logger } from '@common/logging/logger';
import { LOGGER } from '@common/logging/logger.token';
import { Inject, Injectable } from '@nestjs/common';
import { ApplicationError } from '../../../common/errors/application.error';
import { UnitCategoryEntity } from '../entities/unit-category.entity';
import { UpdateUnitCategoryInput } from '../inputs/update-unit-category.input';
import { UNIT_CATEGORY_REPOSITORY } from '../repositories/unit-category-repository.token';
import type { UnitCategoryRepository } from '../repositories/unit-category.repository';

@Injectable()
export class UpdateUnitCategoryUseCase {
  constructor(
    @Inject(UNIT_CATEGORY_REPOSITORY)
    private readonly unitCategoryRepository: UnitCategoryRepository,
    @Inject(LOGGER)
    private readonly logger: Logger,
  ) {}

  async execute(id: string, data: UpdateUnitCategoryInput): Promise<UnitCategoryEntity> {
    const updatedUnitCategory = await this.unitCategoryRepository.update(id, data);

    if (!updatedUnitCategory) {
      this.logger.warn('Unit category not found for update', { unitCategoryId: id });
      throw new ApplicationError('UNIT_CATEGORY_NOT_FOUND');
    }

    this.logger.info('Unit category updated', { unitCategoryId: id });
    return updatedUnitCategory;
  }
}
