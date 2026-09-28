import type { Logger } from '@common/logging/logger';
import { LOGGER } from '@common/logging/logger.token';
import { Inject, Injectable } from '@nestjs/common';
import { PaginatedResult } from '@common/pagination/pagination.types';
import { createPaginationMeta } from '@common/pagination/pagination.utils';
import { CityEntity } from '../entities/city.entity';
import { CityFilter } from '../repositories/city-filter';
import { CITY_REPOSITORY } from '../repositories/city-repository.token';
import type { CityRepository } from '../repositories/city.repository';

@Injectable()
export class FindAllCitiesUseCase {
  constructor(
    @Inject(CITY_REPOSITORY) private readonly cityRepository: CityRepository,
    @Inject(LOGGER)
    private readonly logger: Logger,
  ) {}

  async execute(filter: CityFilter = {}): Promise<PaginatedResult<CityEntity>> {
    const { page = 1, limit = 10 } = filter;

    const { items, total } = await this.cityRepository.find(filter);

    this.logger.debug('Cities listed', { page, limit, total });

    return {
      data: items,
      meta: createPaginationMeta(page, limit, total),
    };
  }
}
