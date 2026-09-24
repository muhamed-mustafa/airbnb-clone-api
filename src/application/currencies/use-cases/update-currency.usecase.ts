import { Inject, Injectable } from '@nestjs/common';
import { ApplicationError } from '../../../common/errors/application.error';
import { CurrencyEntity } from '../entities/currency.entity';
import { UpdateCurrencyInput } from '../inputs/update-currency.input';
import { CURRENCY_REPOSITORY } from '../repositories/currency-repository.token';
import type { CurrencyRepository } from '../repositories/currency.repository';

@Injectable()
export class UpdateCurrencyUseCase {
  constructor(
    @Inject(CURRENCY_REPOSITORY) private readonly currencyRepository: CurrencyRepository,
  ) {}

  async execute(id: string, data: UpdateCurrencyInput): Promise<CurrencyEntity> {
    const updatedCurrency = await this.currencyRepository.update(id, data);

    if (!updatedCurrency) {
      throw new ApplicationError('CURRENCY_NOT_FOUND');
    }

    return updatedCurrency;
  }
}
