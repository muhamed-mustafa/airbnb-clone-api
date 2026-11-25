import { UnitsModule } from '@app/units.module';
import { UNIT_FAVORITE_REPOSITORY } from '@application/favorites/repositories/unit-favorite-repository.token';
import { FavoritesService } from '@application/favorites/services/favorites.service';
import { AddUnitFavoriteUseCase } from '@application/favorites/use-cases/add-unit-favorite.usecase';
import { FindMyUnitFavoritesUseCase } from '@application/favorites/use-cases/find-my-unit-favorites.usecase';
import { RemoveUnitFavoriteUseCase } from '@application/favorites/use-cases/remove-unit-favorite.usecase';
import { modelNames } from '@common/constants/model-names.constant';
import { MongooseUnitFavoriteRepository } from '@infrastructure/favorites/repositories/mongoose-unit-favorite.repository';
import { UnitFavoriteSchema } from '@infrastructure/favorites/schemas/unit-favorite.schema';
import { UnitSchema } from '@infrastructure/units/schemas/units.schema';
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { FavoritesController } from '@presentation/favorites/favorites.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: modelNames.UNIT_FAVORITES, schema: UnitFavoriteSchema },
      { name: modelNames.UNITS, schema: UnitSchema },
    ]),
    UnitsModule,
  ],
  controllers: [FavoritesController],
  providers: [
    FavoritesService,
    AddUnitFavoriteUseCase,
    FindMyUnitFavoritesUseCase,
    RemoveUnitFavoriteUseCase,
    { provide: UNIT_FAVORITE_REPOSITORY, useClass: MongooseUnitFavoriteRepository },
  ],
  exports: [UNIT_FAVORITE_REPOSITORY],
})
export class FavoritesModule {}
