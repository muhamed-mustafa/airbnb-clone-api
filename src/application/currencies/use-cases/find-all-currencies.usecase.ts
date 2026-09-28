import type { Logger } from '@common/logging/logger';
import { LOGGER } from '@common/logging/logger.token';
import { Inject, Injectable } from '@nestjs/common';
import { PaginatedResult } from '../../../common/pagination/pagination.types';
import { createPaginationMeta } from '../../../common/pagination/pagination.utils';
import { CurrencyEntity } from '../entities/currency.entity';
import { CurrencyFilter } from '../repositories/currency-filter';
import { CURRENCY_REPOSITORY } from '../repositories/currency-repository.token';
import type { CurrencyRepository } from '../repositories/currency.repository';

@Injectable()
export class FindAllCurrenciesUseCase {
  constructor(
    @Inject(CURRENCY_REPOSITORY) private readonly currencyRepository: CurrencyRepository,
    @Inject(LOGGER)
    private readonly logger: Logger,
  ) {}

  async execute(filter: CurrencyFilter = {}): Promise<PaginatedResult<CurrencyEntity>> {
    const { page = 1, limit = 10 } = filter;

    const { items, total } = await this.currencyRepository.find(filter);

    this.logger.debug('Currencies listed', { page, limit, total });

    return {
      data: items,
      meta: createPaginationMeta(page, limit, total),
    };
  }
}
