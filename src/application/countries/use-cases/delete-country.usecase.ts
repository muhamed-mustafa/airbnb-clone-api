import { Inject, Injectable } from '@nestjs/common';
import { ApplicationError } from '../../../common/errors/application.error';
import { COUNTRY_REPOSITORY } from '../repositories/country-repository.token';
import type { CountryRepository } from '../repositories/country.repository';

@Injectable()
export class DeleteCountryUseCase {
  constructor(@Inject(COUNTRY_REPOSITORY) private readonly countryRepository: CountryRepository) {}

  async execute(id: string): Promise<void> {
    const country = await this.countryRepository.findById(id);

    if (!country) {
      throw new ApplicationError('COUNTRY_NOT_FOUND');
    }

    await this.countryRepository.delete(id);
  }
}
