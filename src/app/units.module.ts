import { UNIT_REPOSITORY } from '@application/units/repositories/unit-repository.token';
import { UnitService } from '@application/units/services/unit.service';
import { CreateUnitUseCase } from '@application/units/use-cases/create-unit.usecase';
import { UnitValidationUseCase } from '@application/units/use-cases/unit-validation.usecase';
import { modelNames } from '@common/constants/model-names.constant';
import { MongooseUnitRepository } from '@infrastructure/units/repositories/mongoose-unit.repository';
import { UnitSchema } from '@infrastructure/units/schemas/units.schema';
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UnitsController } from '@presentation/units/units.controller';
import { AppSettingsModule } from './app-settings.module';
import { CitiesModule } from './cities.module';
import { CountriesModule } from './countries.module';
import { UnitCategoriesModule } from './unit-categories.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: modelNames.UNITS, schema: UnitSchema }]),
    AppSettingsModule,
    UnitCategoriesModule,
    CountriesModule,
    CitiesModule,
  ],
  controllers: [UnitsController],
  providers: [
    UnitService,
    CreateUnitUseCase,
    UnitValidationUseCase,
    {
      provide: UNIT_REPOSITORY,
      useClass: MongooseUnitRepository,
    },
  ],
})
export class UnitsModule {}
