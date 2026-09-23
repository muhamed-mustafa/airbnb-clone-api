import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CITY_REPOSITORY } from '@application/cities/repositories/city-repository.token';
import { CityService } from '@application/cities/services/city.service';
import { CreateCityUseCase } from '@application/cities/use-cases/create-city.usecase';
import { DeleteCityUseCase } from '@application/cities/use-cases/delete-city.usecase';
import { FindAllCitiesUseCase } from '@application/cities/use-cases/find-all-cities.usecase';
import { FindCityByIdUseCase } from '@application/cities/use-cases/find-city-by-id.usecase';
import { UpdateCityUseCase } from '@application/cities/use-cases/update-city.usecase';
import { MongooseCityRepository } from '@infrastructure/cities/repositories/mongoose-city.repository';
import { City, CitySchema } from '@infrastructure/cities/schemas/cities.schema';
import { CityController } from '@presentation/cities/city.controller';
import { CountriesModule } from './countries.module';

@Module({
  imports: [MongooseModule.forFeature([{ name: City.name, schema: CitySchema }]), CountriesModule],
  controllers: [CityController],
  providers: [
    CityService,
    CreateCityUseCase,
    FindAllCitiesUseCase,
    FindCityByIdUseCase,
    UpdateCityUseCase,
    DeleteCityUseCase,
    { provide: CITY_REPOSITORY, useClass: MongooseCityRepository },
  ],
  exports: [CityService],
})
export class CitiesModule {}
