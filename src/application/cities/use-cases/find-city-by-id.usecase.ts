import { Inject, Injectable } from '@nestjs/common';
import { ApplicationError } from '@common/errors/application.error';
import { CityEntity } from '../entities/city.entity';
import { CITY_REPOSITORY } from '../repositories/city-repository.token';
import type { CityRepository } from '../repositories/city.repository';

@Injectable()
export class FindCityByIdUseCase {
  constructor(@Inject(CITY_REPOSITORY) private readonly cityRepository: CityRepository) {}

  async execute(id: string): Promise<CityEntity> {
    const city = await this.cityRepository.findById(id);

    if (!city) {
      throw new ApplicationError('CITY_NOT_FOUND');
    }

    return city;
  }
}
