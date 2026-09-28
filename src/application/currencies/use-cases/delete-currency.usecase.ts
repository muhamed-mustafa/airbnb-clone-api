import type { Logger } from '@common/logging/logger';
import { LOGGER } from '@common/logging/logger.token';
import { Inject, Injectable } from '@nestjs/common';
import { ApplicationError } from '@common/errors/application.error';
import { CURRENCY_REPOSITORY } from '../repositories/currency-repository.token';
import type { CurrencyRepository } from '../repositories/currency.repository';

@Injectable()
export class DeleteCurrencyUseCase {
  constructor(
    @Inject(CURRENCY_REPOSITORY) private readonly currencyRepository: CurrencyRepository,
    @Inject(LOGGER)
    private readonly logger: Logger,
  ) {}

  async execute(id: string): Promise<void> {
    const deleted = await this.currencyRepository.delete(id);

    if (!deleted) {
      this.logger.warn('Currency not found for deletion', { currencyId: id });
      throw new ApplicationError('CURRENCY_NOT_FOUND');
    }

    this.logger.info('Currency deleted', { currencyId: id });
  }
}
