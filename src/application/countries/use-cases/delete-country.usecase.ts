import { Inject, Injectable } from '@nestjs/common';
import { CITY_REPOSITORY } from '@application/cities/repositories/city-repository.token';
import type { CityRepository } from '@application/cities/repositories/city.repository';
import type { TransactionRunner } from '@common/transactions/transaction-runner';
import { TRANSACTION_RUNNER } from '@common/transactions/transaction-runner.token';
import { ApplicationError } from '../../../common/errors/application.error';
import { COUNTRY_REPOSITORY } from '../repositories/country-repository.token';
import type { CountryRepository } from '../repositories/country.repository';

@Injectable()
export class DeleteCountryUseCase {
  constructor(
    @Inject(COUNTRY_REPOSITORY) private readonly countryRepository: CountryRepository,
    @Inject(CITY_REPOSITORY) private readonly cityRepository: CityRepository,
    @Inject(TRANSACTION_RUNNER) private readonly transactionRunner: TransactionRunner,
  ) {}

  async execute(id: string): Promise<void> {
    await this.transactionRunner.run(async (session) => {
      const deleted = await this.countryRepository.delete(id, session);

      if (!deleted) {
        throw new ApplicationError('COUNTRY_NOT_FOUND');
      }

      await this.cityRepository.deleteByCountry(id, session);
    });
  }
}
