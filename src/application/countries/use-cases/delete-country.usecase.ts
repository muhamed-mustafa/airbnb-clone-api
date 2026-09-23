import { Inject, Injectable } from '@nestjs/common';
import { CITY_REPOSITORY } from '@application/cities/repositories/city-repository.token';
import type { CityRepository } from '@application/cities/repositories/city.repository';
import { ApplicationError } from '../../../common/errors/application.error';
import { COUNTRY_REPOSITORY } from '../repositories/country-repository.token';
import type { CountryRepository } from '../repositories/country.repository';

@Injectable()
export class DeleteCountryUseCase {
  constructor(
    @Inject(COUNTRY_REPOSITORY) private readonly countryRepository: CountryRepository,
    @Inject(CITY_REPOSITORY) private readonly cityRepository: CityRepository,
  ) {}

  async execute(id: string): Promise<void> {
    // Only an active country is matched, so this both verifies and soft-deletes it.
    const country = await this.countryRepository.delete(id);

    if (!country) {
      throw new ApplicationError('COUNTRY_NOT_FOUND');
    }

    // A deleted country must never leave its cities active.
    await this.cityRepository.deleteByCountry(id);
  }
}
