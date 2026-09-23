import { Inject, Injectable } from '@nestjs/common';
import { PaginatedResult } from '../../../common/pagination/pagination.types';
import { createPaginationMeta } from '../../../common/pagination/pagination.utils';
import { CountryEntity } from '../entities/country.entity';
import { CountryFilter } from '../repositories/country-filter';
import { COUNTRY_REPOSITORY } from '../repositories/country-repository.token';
import type { CountryRepository } from '../repositories/country.repository';

@Injectable()
export class FindAllCountriesUseCase {
  constructor(@Inject(COUNTRY_REPOSITORY) private readonly countryRepository: CountryRepository) {}

  async execute(filter: CountryFilter = {}): Promise<PaginatedResult<CountryEntity>> {
    const { page = 1, limit = 10 } = filter;

    const { items, total } = await this.countryRepository.find(filter);

    return {
      data: items,
      meta: createPaginationMeta(page, limit, total),
    };
  }
}
