import type { Logger } from '@common/logging/logger';
import { LOGGER } from '@common/logging/logger.token';
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
    @Inject(LOGGER)
    private readonly logger: Logger,
  ) {}

  async execute(id: string, data: UpdateCurrencyInput): Promise<CurrencyEntity> {
    const updatedCurrency = await this.currencyRepository.update(id, data);

    if (!updatedCurrency) {
      this.logger.warn('Currency not found for update', { currencyId: id });
      throw new ApplicationError('CURRENCY_NOT_FOUND');
    }

    this.logger.info('Currency updated', { currencyId: id });
    return updatedCurrency;
  }
}
