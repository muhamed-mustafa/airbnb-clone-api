import type { Logger } from '@common/logging/logger';
import { LOGGER } from '@common/logging/logger.token';
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
    @Inject(LOGGER)
    private readonly logger: Logger,
  ) {}

  async execute(data: CreateCurrencyInput): Promise<CurrencyEntity> {
    const exists = await this.currencyRepository.existsByNameOrCode(data.name, data.currencyCode);

    if (exists) {
      this.logger.warn('Currency creation rejected: already exists', { name: data.name });
      throw new ApplicationError('CURRENCY_ALREADY_EXISTS');
    }

    const currency = await this.currencyRepository.create(data);
    this.logger.info('Currency created', { currencyId: currency.id });
    return currency;
  }
}
