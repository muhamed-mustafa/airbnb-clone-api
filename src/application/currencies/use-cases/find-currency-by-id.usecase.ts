import type { Logger } from '@common/logging/logger';
import { LOGGER } from '@common/logging/logger.token';
import { Inject, Injectable } from '@nestjs/common';
import { ApplicationError } from '../../../common/errors/application.error';
import { CurrencyEntity } from '../entities/currency.entity';
import { CURRENCY_REPOSITORY } from '../repositories/currency-repository.token';
import type { CurrencyRepository } from '../repositories/currency.repository';

@Injectable()
export class FindCurrencyByIdUseCase {
  constructor(
    @Inject(CURRENCY_REPOSITORY) private readonly currencyRepository: CurrencyRepository,
    @Inject(LOGGER)
    private readonly logger: Logger,
  ) {}

  async execute(id: string): Promise<CurrencyEntity> {
    const currency = await this.currencyRepository.findById(id);

    if (!currency) {
      this.logger.debug('Currency not found', { currencyId: id });
      throw new ApplicationError('CURRENCY_NOT_FOUND');
    }

    this.logger.debug('Currency retrieved', { currencyId: id });
    return currency;
  }
}
