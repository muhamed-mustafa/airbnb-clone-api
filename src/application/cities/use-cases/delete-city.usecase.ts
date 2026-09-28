import type { Logger } from '@common/logging/logger';
import { LOGGER } from '@common/logging/logger.token';
import { Inject, Injectable } from '@nestjs/common';
import { ApplicationError } from '@common/errors/application.error';
import { CITY_REPOSITORY } from '../repositories/city-repository.token';
import type { CityRepository } from '../repositories/city.repository';

@Injectable()
export class DeleteCityUseCase {
  constructor(
    @Inject(CITY_REPOSITORY) private readonly cityRepository: CityRepository,
    @Inject(LOGGER)
    private readonly logger: Logger,
  ) {}

  async execute(id: string): Promise<void> {
    const deleted = await this.cityRepository.delete(id);

    if (!deleted) {
      this.logger.warn('City not found for deletion', { cityId: id });
      throw new ApplicationError('CITY_NOT_FOUND');
    }

    this.logger.info('City deleted', { cityId: id });
  }
}
