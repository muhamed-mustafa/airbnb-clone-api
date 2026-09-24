import { CurrencyEntity } from '../entities/currency.entity';
import { CreateCurrencyInput } from '../inputs/create-currency.input';
import { UpdateCurrencyInput } from '../inputs/update-currency.input';
import { CurrencyFilter } from './currency-filter';

export interface CurrencyRepository {
  create(currency: CreateCurrencyInput): Promise<CurrencyEntity>;
  existsByNameOrCode(name: string, currencyCode: string): Promise<boolean>;
  find(filter: CurrencyFilter): Promise<{ items: CurrencyEntity[]; total: number }>;
  findById(id: string): Promise<CurrencyEntity | null>;
  update(id: string, currency: UpdateCurrencyInput): Promise<CurrencyEntity | null>;
  delete(id: string): Promise<boolean>;
}
