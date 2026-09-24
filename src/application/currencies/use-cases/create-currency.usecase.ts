import { Inject, Injectable } from '@nestjs/common';
import { ApplicationError } from '../../../common/errors/application.error';
import { CurrencyEntity } from '../entities/currency.entity';
import { CreateCurrencyInput } from '../inputs/create-currency.input';
import { CURRENCY_REPOSITORY } from '../repositories/currency-repository.token';
import type { CurrencyRepository } from '../repositories/currency.repository';

@Injectable()
export class CreateCurrencyUseCase {
  constructor(
    @Inject(CURRENCY_REPOSITORY) private readonly currencyRepository: CurrencyRepository,
  ) {}

  async execute(data: CreateCurrencyInput): Promise<CurrencyEntity> {
    const exists = await this.currencyRepository.existsByNameOrCode(data.name, data.currencyCode);

    if (exists) {
      throw new ApplicationError('CURRENCY_ALREADY_EXISTS');
    }

    return this.currencyRepository.create(data);
  }
}
