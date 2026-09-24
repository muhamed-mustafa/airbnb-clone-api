import type { HydratedDocument } from 'mongoose';
import type { CurrencyEntity } from '../../../application/currencies/entities/currency.entity';
import type { Currency } from '../schemas/currencies.schema';

export class CurrencyMapper {
  static toEntity(currency: HydratedDocument<Currency>): CurrencyEntity {
    return {
      id: currency._id.toString(),
      name: currency.name,
      currencyCode: currency.currencyCode,
    };
  }
}
