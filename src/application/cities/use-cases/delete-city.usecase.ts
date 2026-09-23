import { Inject, Injectable } from '@nestjs/common';
import { ApplicationError } from '@common/errors/application.error';
import { CITY_REPOSITORY } from '../repositories/city-repository.token';
import type { CityRepository } from '../repositories/city.repository';

@Injectable()
export class DeleteCityUseCase {
  constructor(@Inject(CITY_REPOSITORY) private readonly cityRepository: CityRepository) {}

  async execute(id: string): Promise<void> {
    const deleted = await this.cityRepository.delete(id);

    if (!deleted) {
      throw new ApplicationError('CITY_NOT_FOUND');
    }
  }
}
