import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CITY_REPOSITORY } from '@application/cities/repositories/city-repository.token';
import { COUNTRY_REPOSITORY } from '@application/countries/repositories/country-repository.token';
import { CountryService } from '@application/countries/services/country.service';
import { CreateCountryUseCase } from '@application/countries/use-cases/create-country.usecase';
import { DeleteCountryUseCase } from '@application/countries/use-cases/delete-country.usecase';
import { FindAllCountriesUseCase } from '@application/countries/use-cases/find-all-countries.usecase';
import { FindCountryByIdUseCase } from '@application/countries/use-cases/find-country-by-id.usecase';
import { UpdateCountryUseCase } from '@application/countries/use-cases/update-country.usecase';
import { MongooseCityRepository } from '@infrastructure/cities/repositories/mongoose-city.repository';
import { City, CitySchema } from '@infrastructure/cities/schemas/cities.schema';
import { MongooseCountryRepository } from '@infrastructure/countries/repositories/mongoose-country.repository';
import { Country, CountrySchema } from '@infrastructure/countries/schemas/countries.schema';
import { CountryController } from '@presentation/countries/country.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Country.name, schema: CountrySchema },
      // Country deletion cascades to cities; CitiesModule imports this module, so bind here.
      { name: City.name, schema: CitySchema },
    ]),
  ],
  controllers: [CountryController],
  providers: [
    CountryService,
    CreateCountryUseCase,
    FindAllCountriesUseCase,
    FindCountryByIdUseCase,
    UpdateCountryUseCase,
    DeleteCountryUseCase,
    { provide: COUNTRY_REPOSITORY, useClass: MongooseCountryRepository },
    { provide: CITY_REPOSITORY, useClass: MongooseCityRepository },
  ],
  exports: [CountryService],
})
export class CountriesModule {}
