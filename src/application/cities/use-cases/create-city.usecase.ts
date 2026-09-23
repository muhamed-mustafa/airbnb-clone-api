import { Inject, Injectable } from '@nestjs/common';
import { ApplicationError } from '@common/errors/application.error';
import { CountryService } from '@application/countries/services/country.service';
import { CityEntity } from '../entities/city.entity';
import { CreateCityInput } from '../inputs/create-city.input';
import { CITY_REPOSITORY } from '../repositories/city-repository.token';
import type { CityRepository } from '../repositories/city.repository';

@Injectable()
export class CreateCityUseCase {
  constructor(
    @Inject(CITY_REPOSITORY) private readonly cityRepository: CityRepository,
    private readonly countryService: CountryService,
  ) {}

  async execute(data: CreateCityInput): Promise<CityEntity> {
    // Throws COUNTRY_NOT_FOUND for a missing or soft-deleted country.
    await this.countryService.findById(data.country);

    const exists = await this.cityRepository.existsByCountryAndName(data.country, data.name);

    if (exists) {
      throw new ApplicationError('CITY_ALREADY_EXISTS');
    }

    return this.cityRepository.create(data);
  }
}
