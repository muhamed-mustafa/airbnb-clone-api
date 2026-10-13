import { ActivateUnitUseCase } from '@application/units/use-cases/activate-unit.usecase';
import { DeactivateUnitUseCase } from '@application/units/use-cases/deactivate-unit.usecase';
import { DeleteUnitUseCase } from '@application/units/use-cases/delete-unit.usecase';
import { UNIT_REPOSITORY } from '@application/units/repositories/unit-repository.token';
import { UnitService } from '@application/units/services/unit.service';
import { CheckUnitAuthUseCase } from '@application/units/use-cases/check-unit-auth.usecase';
import { CreateUnitUseCase } from '@application/units/use-cases/create-unit.usecase';
import { FindAllUnitsUseCase } from '@application/units/use-cases/find-all.usecase';
import { FindAllMyUnitsUseCase } from '@application/units/use-cases/find-my-units.usecase';
import { FindOneUnitUseCase } from '@application/units/use-cases/find-one-unit.usecase';
import { UnitValidationUseCase } from '@application/units/use-cases/unit-validation.usecase';
import { UpdateUnitUseCase } from '@application/units/use-cases/update-unit.usecase';
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
    FindOneUnitUseCase,
    UpdateUnitUseCase,
    ActivateUnitUseCase,
    DeactivateUnitUseCase,
    DeleteUnitUseCase,
    CheckUnitAuthUseCase,
    FindAllUnitsUseCase,
    FindAllMyUnitsUseCase,
    {
      provide: UNIT_REPOSITORY,
      useClass: MongooseUnitRepository,
    },
  ],
})
export class UnitsModule {}
