import { Inject, Injectable } from '@nestjs/common';
import { ApplicationError } from '../../../common/errors/application.error';
import { CountryEntity } from '../entities/country.entity';
import { UpdateCountryInput } from '../inputs/update-country.input';
import { COUNTRY_REPOSITORY } from '../repositories/country-repository.token';
import type { CountryRepository } from '../repositories/country.repository';

@Injectable()
export class UpdateCountryUseCase {
  constructor(@Inject(COUNTRY_REPOSITORY) private readonly countryRepository: CountryRepository) {}

  async execute(id: string, data: UpdateCountryInput): Promise<CountryEntity> {
    const country = await this.countryRepository.findById(id);

    if (!country) {
      throw new ApplicationError('COUNTRY_NOT_FOUND');
    }

    const updatedCountry = await this.countryRepository.update(id, data);

    if (!updatedCountry) {
      throw new ApplicationError('COUNTRY_NOT_FOUND');
    }

    return updatedCountry;
  }
}
