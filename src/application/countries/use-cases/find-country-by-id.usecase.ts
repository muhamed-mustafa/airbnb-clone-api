import type { Logger } from '@common/logging/logger';
import { LOGGER } from '@common/logging/logger.token';
import { Inject, Injectable } from '@nestjs/common';
import { ApplicationError } from '../../../common/errors/application.error';
import { CountryEntity } from '../entities/country.entity';
import { COUNTRY_REPOSITORY } from '../repositories/country-repository.token';
import type { CountryRepository } from '../repositories/country.repository';

@Injectable()
export class FindCountryByIdUseCase {
  constructor(
    @Inject(COUNTRY_REPOSITORY) private readonly countryRepository: CountryRepository,
    @Inject(LOGGER)
    private readonly logger: Logger,
  ) {}

  async execute(id: string): Promise<CountryEntity> {
    const country = await this.countryRepository.findById(id);

    if (!country) {
      this.logger.debug('Country not found', { countryId: id });
      throw new ApplicationError('COUNTRY_NOT_FOUND');
    }

    this.logger.debug('Country retrieved', { countryId: id });
    return country;
  }
}
