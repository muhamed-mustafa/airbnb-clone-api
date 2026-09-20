import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { COUNTRY_REPOSITORY } from '@application/countries/repositories/country-repository.token';
import { CountryService } from '@application/countries/services/country.service';
import { CreateCountryUseCase } from '@application/countries/use-cases/create-country.usecase';
import { DeleteCountryUseCase } from '@application/countries/use-cases/delete-country.usecase';
import { FindAllCountriesUseCase } from '@application/countries/use-cases/find-all-countries.usecase';
import { FindCountryByIdUseCase } from '@application/countries/use-cases/find-country-by-id.usecase';
import { UpdateCountryUseCase } from '@application/countries/use-cases/update-country.usecase';
import { MongooseCountryRepository } from '@infrastructure/countries/repositories/mongoose-country.repository';
import { Country, CountrySchema } from '@infrastructure/countries/schemas/countries.schema';
import { CountryController } from '@presentation/countries/country.controller';

@Module({
  imports: [MongooseModule.forFeature([{ name: Country.name, schema: CountrySchema }])],
  controllers: [CountryController],
  providers: [
    CountryService,
    CreateCountryUseCase,
    FindAllCountriesUseCase,
    FindCountryByIdUseCase,
    UpdateCountryUseCase,
    DeleteCountryUseCase,
    { provide: COUNTRY_REPOSITORY, useClass: MongooseCountryRepository },
  ],
  exports: [CountryService],
})
export class CountriesModule {}
