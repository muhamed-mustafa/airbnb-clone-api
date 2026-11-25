import { AddUnitFavoriteUseCase } from '@application/favorites/use-cases/add-unit-favorite.usecase';
import { FindMyUnitFavoritesUseCase } from '@application/favorites/use-cases/find-my-unit-favorites.usecase';
import { RemoveUnitFavoriteUseCase } from '@application/favorites/use-cases/remove-unit-favorite.usecase';
import type { PaginatedResult } from '@common/pagination/pagination.types';
import { Injectable } from '@nestjs/common';

@Injectable()
export class FavoritesService {
  constructor(
    private readonly addUnitFavoriteUseCase: AddUnitFavoriteUseCase,
    private readonly findMyUnitFavoritesUseCase: FindMyUnitFavoritesUseCase,
    private readonly removeUnitFavoriteUseCase: RemoveUnitFavoriteUseCase,
  ) {}

  add(userId: string, unitId: string): Promise<UnitFavoriteEntity> {
    return this.addUnitFavoriteUseCase.execute(userId, unitId);
  }

  findMy(
    userId: string,
    page: number,
    limit: number,
  ): Promise<PaginatedResult<UnitFavoriteEntity>> {
    return this.findMyUnitFavoritesUseCase.execute(userId, page, limit);
  }

  remove(userId: string, unitId: string): Promise<void> {
    return this.removeUnitFavoriteUseCase.execute(userId, unitId);
  }
}
import type { UnitFavoriteEntity } from '@application/favorites/entities/unit-favorite.entity';
