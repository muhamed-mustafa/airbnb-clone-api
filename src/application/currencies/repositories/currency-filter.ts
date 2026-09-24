import { CurrencyEntity } from '../entities/currency.entity';

export type CurrencyFilter = Partial<Pick<CurrencyEntity, 'name' | 'currencyCode'>> & {
  isDeleted?: boolean;
  page?: number;
  limit?: number;
};
