import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CURRENCY_REPOSITORY } from '@application/currencies/repositories/currency-repository.token';
import { CurrencyService } from '@application/currencies/services/currency.service';
import { CreateCurrencyUseCase } from '@application/currencies/use-cases/create-currency.usecase';
import { DeleteCurrencyUseCase } from '@application/currencies/use-cases/delete-currency.usecase';
import { FindAllCurrenciesUseCase } from '@application/currencies/use-cases/find-all-currencies.usecase';
import { FindCurrencyByIdUseCase } from '@application/currencies/use-cases/find-currency-by-id.usecase';
import { UpdateCurrencyUseCase } from '@application/currencies/use-cases/update-currency.usecase';
import { MongooseCurrencyRepository } from '@infrastructure/currencies/repositories/mongoose-currency.repository';
import { Currency, CurrencySchema } from '@infrastructure/currencies/schemas/currencies.schema';
import { CurrencyController } from '@presentation/currencies/currency.controller';

@Module({
  imports: [MongooseModule.forFeature([{ name: Currency.name, schema: CurrencySchema }])],
  controllers: [CurrencyController],
  providers: [
    CurrencyService,
    CreateCurrencyUseCase,
    FindAllCurrenciesUseCase,
    FindCurrencyByIdUseCase,
    UpdateCurrencyUseCase,
    DeleteCurrencyUseCase,
    { provide: CURRENCY_REPOSITORY, useClass: MongooseCurrencyRepository },
  ],
  exports: [CurrencyService],
})
export class CurrenciesModule {}
