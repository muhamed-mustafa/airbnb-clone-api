import { Inject, Injectable } from '@nestjs/common';
import { ApplicationError } from '../../../common/errors/application.error';
import { CreateCountryInput } from '../inputs/create-country.input';
import { COUNTRY_REPOSITORY } from '../repositories/country-repository.token';
import type { CountryRepository } from '../repositories/country.repository';
import { CountryEntity } from '../entities/country.entity';

@Injectable()
export class CreateCountryUseCase {
  constructor(@Inject(COUNTRY_REPOSITORY) private readonly countryRepository: CountryRepository) {}

  async execute(data: CreateCountryInput): Promise<CountryEntity> {
    const exists = await this.countryRepository.existsByNameOrCode(data.name, data.code);

    if (exists) {
      throw new ApplicationError('COUNTRY_ALREADY_EXISTS');
    }

    return this.countryRepository.create(data);
  }
}
