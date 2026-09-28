import type { Logger } from '@common/logging/logger';
import { LOGGER } from '@common/logging/logger.token';
import { Inject, Injectable } from '@nestjs/common';
import { ApplicationError } from '@common/errors/application.error';
import { CityEntity } from '../entities/city.entity';
import { CITY_REPOSITORY } from '../repositories/city-repository.token';
import type { CityRepository } from '../repositories/city.repository';

@Injectable()
export class FindCityByIdUseCase {
  constructor(
    @Inject(CITY_REPOSITORY) private readonly cityRepository: CityRepository,
    @Inject(LOGGER)
    private readonly logger: Logger,
  ) {}

  async execute(id: string): Promise<CityEntity> {
    const city = await this.cityRepository.findById(id);

    if (!city) {
      this.logger.debug('City not found', { cityId: id });
      throw new ApplicationError('CITY_NOT_FOUND');
    }

    this.logger.debug('City retrieved', { cityId: id });
    return city;
  }
}
