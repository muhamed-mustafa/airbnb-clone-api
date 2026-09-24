import { Inject, Injectable } from '@nestjs/common';
import { ApplicationError } from '@common/errors/application.error';
import { CURRENCY_REPOSITORY } from '../repositories/currency-repository.token';
import type { CurrencyRepository } from '../repositories/currency.repository';

@Injectable()
export class DeleteCurrencyUseCase {
  constructor(
    @Inject(CURRENCY_REPOSITORY) private readonly currencyRepository: CurrencyRepository,
  ) {}

  async execute(id: string): Promise<void> {
    const deleted = await this.currencyRepository.delete(id);

    if (!deleted) {
      throw new ApplicationError('CURRENCY_NOT_FOUND');
    }
  }
}
