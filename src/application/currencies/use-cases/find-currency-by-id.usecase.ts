import { Inject, Injectable } from '@nestjs/common';
import { ApplicationError } from '../../../common/errors/application.error';
import { CurrencyEntity } from '../entities/currency.entity';
import { CURRENCY_REPOSITORY } from '../repositories/currency-repository.token';
import type { CurrencyRepository } from '../repositories/currency.repository';

@Injectable()
export class FindCurrencyByIdUseCase {
  constructor(
    @Inject(CURRENCY_REPOSITORY) private readonly currencyRepository: CurrencyRepository,
  ) {}

  async execute(id: string): Promise<CurrencyEntity> {
    const currency = await this.currencyRepository.findById(id);

    if (!currency) {
      throw new ApplicationError('CURRENCY_NOT_FOUND');
    }

    return currency;
  }
}
