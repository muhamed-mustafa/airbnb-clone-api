import type { CurrencyEntity } from '../../../application/currencies/entities/currency.entity';
import type { CreateCurrencyInput } from '../../../application/currencies/inputs/create-currency.input';
import { CurrencyResponseDto } from '../dtos/currency-response.dto';
import { CreateCurrencyDto } from '../dtos/create-currency.dto';

export class CurrencyMapper {
  static toCurrencyInput(currency: CreateCurrencyDto): CreateCurrencyInput {
    return {
      name: currency.name,
      currencyCode: currency.currencyCode,
    };
  }

  static toResponse(currency: CurrencyEntity): CurrencyResponseDto {
    return {
      id: currency.id,
      name: currency.name,
      currencyCode: currency.currencyCode,
    };
  }
}
