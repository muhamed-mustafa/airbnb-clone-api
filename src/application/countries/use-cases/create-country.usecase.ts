import type { Logger } from '@common/logging/logger';
import { LOGGER } from '@common/logging/logger.token';
import { Inject, Injectable } from '@nestjs/common';
import { ApplicationError } from '../../../common/errors/application.error';
import { CreateCountryInput } from '../inputs/create-country.input';
import { COUNTRY_REPOSITORY } from '../repositories/country-repository.token';
import type { CountryRepository } from '../repositories/country.repository';
import { CountryEntity } from '../entities/country.entity';

@Injectable()
export class CreateCountryUseCase {
  constructor(
    @Inject(COUNTRY_REPOSITORY) private readonly countryRepository: CountryRepository,
    @Inject(LOGGER)
    private readonly logger: Logger,
  ) {}

  async execute(data: CreateCountryInput): Promise<CountryEntity> {
    const exists = await this.countryRepository.existsByNameOrCode(data.name, data.code);

    if (exists) {
      this.logger.warn('Country creation rejected: already exists', { name: data.name });
      throw new ApplicationError('COUNTRY_ALREADY_EXISTS');
    }

    const country = await this.countryRepository.create(data);
    this.logger.info('Country created', { countryId: country.id });
    return country;
  }
}
