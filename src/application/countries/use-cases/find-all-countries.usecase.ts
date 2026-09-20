import { Inject, Injectable } from '@nestjs/common';
import { CountryEntity } from '../entities/country.entity';
import { CountryFilter } from '../repositories/country-filter';
import { COUNTRY_REPOSITORY } from '../repositories/country-repository.token';
import type { CountryRepository } from '../repositories/country.repository';

@Injectable()
export class FindAllCountriesUseCase {
  constructor(@Inject(COUNTRY_REPOSITORY) private readonly countryRepository: CountryRepository) {}

  async execute(query: CountryFilter = {}): Promise<CountryEntity[]> {
    return await this.countryRepository.find({ ...query, isDeleted: false });
  }
}
