import type { Logger } from '@common/logging/logger';
import { LOGGER } from '@common/logging/logger.token';
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
    @Inject(LOGGER)
    private readonly logger: Logger,
  ) {}

  async execute(data: CreateCityInput): Promise<CityEntity> {
    // Throws COUNTRY_NOT_FOUND for a missing or soft-deleted country.
    await this.countryService.findById(data.country);

    const exists = await this.cityRepository.existsByCountryAndName(data.country, data.name);

    if (exists) {
      this.logger.warn('City creation rejected: already exists', { name: data.name });
      throw new ApplicationError('CITY_ALREADY_EXISTS');
    }

    const city = await this.cityRepository.create(data);
    this.logger.info('City created', { cityId: city.id });
    return city;
  }
}
