import { modelNames } from '@common/constants/model-names.constant';
import { UnitSchema } from '@infrastructure/units/schemas/units.schema';
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UnitsController } from '@presentation/units/units.controller';

@Module({
  imports: [MongooseModule.forFeature([{ name: modelNames.UNITS, schema: UnitSchema }])],
  controllers: [UnitsController],
  providers: [],
  exports: [],
})
export class UnitsModule {}
