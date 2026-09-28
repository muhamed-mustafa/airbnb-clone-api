import type { Logger } from '@common/logging/logger';
import { LOGGER } from '@common/logging/logger.token';
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
    @Inject(LOGGER)
    private readonly logger: Logger,
  ) {}

  async execute(data: CreateUnitCategoryInput): Promise<UnitCategoryEntity> {
    const exists = await this.unitCategoryRepository.existsByName(data.name);

    if (exists) {
      this.logger.warn('Unit category creation rejected: already exists', { name: data.name });
      throw new ApplicationError('UNIT_CATEGORY_ALREADY_EXISTS');
    }

    const unitCategory = await this.unitCategoryRepository.create(data);
    this.logger.info('Unit category created', { unitCategoryId: unitCategory.id });
    return unitCategory;
  }
}
