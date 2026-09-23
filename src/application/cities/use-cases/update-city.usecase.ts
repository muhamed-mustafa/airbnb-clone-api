import { Inject, Injectable } from '@nestjs/common';
import { ApplicationError } from '@common/errors/application.error';
import { CountryService } from '@application/countries/services/country.service';
import { CityEntity } from '../entities/city.entity';
import { UpdateCityInput } from '../inputs/update-city.input';
import { CITY_REPOSITORY } from '../repositories/city-repository.token';
import type { CityRepository } from '../repositories/city.repository';

@Injectable()
export class UpdateCityUseCase {
  constructor(
    @Inject(CITY_REPOSITORY) private readonly cityRepository: CityRepository,
    private readonly countryService: CountryService,
  ) {}

  async execute(id: string, data: UpdateCityInput): Promise<CityEntity> {
    if (data.country !== undefined) {
      await this.countryService.findById(data.country);
    }

    // Duplicate { country, name } pairs are rejected by the unique index.
    const updatedCity = await this.cityRepository.update(id, data);

    if (!updatedCity) {
      throw new ApplicationError('CITY_NOT_FOUND');
    }

    return updatedCity;
  }
}
