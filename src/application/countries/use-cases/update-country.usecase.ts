import type { Logger } from '@common/logging/logger';
import { LOGGER } from '@common/logging/logger.token';
import { Inject, Injectable } from '@nestjs/common';
import { ApplicationError } from '../../../common/errors/application.error';
import { CountryEntity } from '../entities/country.entity';
import { UpdateCountryInput } from '../inputs/update-country.input';
import { COUNTRY_REPOSITORY } from '../repositories/country-repository.token';
import type { CountryRepository } from '../repositories/country.repository';

@Injectable()
export class UpdateCountryUseCase {
  constructor(
    @Inject(COUNTRY_REPOSITORY) private readonly countryRepository: CountryRepository,
    @Inject(LOGGER)
    private readonly logger: Logger,
  ) {}

  async execute(id: string, data: UpdateCountryInput): Promise<CountryEntity> {
    const updatedCountry = await this.countryRepository.update(id, data);

    if (!updatedCountry) {
      this.logger.warn('Country not found for update', { countryId: id });
      throw new ApplicationError('COUNTRY_NOT_FOUND');
    }

    this.logger.info('Country updated', { countryId: id });
    return updatedCountry;
  }
}
