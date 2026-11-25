import { UNIT_FAVORITE_REPOSITORY } from '@application/favorites/repositories/unit-favorite-repository.token';
import type { UnitFavoriteRepository } from '@application/favorites/repositories/unit-favorite.repository';
import { createPaginationMeta } from '@common/pagination/pagination.utils';
import type { PaginatedResult } from '@common/pagination/pagination.types';
import { Inject, Injectable } from '@nestjs/common';

@Injectable()
export class FindMyUnitFavoritesUseCase {
  constructor(
    @Inject(UNIT_FAVORITE_REPOSITORY)
    private readonly favoriteRepository: UnitFavoriteRepository,
  ) {}

  async execute(
    userId: string,
    page = 1,
    limit = 10,
  ): Promise<PaginatedResult<UnitFavoriteEntity>> {
    const result = await this.favoriteRepository.findForUser(userId, page, limit);

    return {
      data: result.items,
      meta: createPaginationMeta(page, limit, result.total),
    };
  }
}
import type { UnitFavoriteEntity } from '@application/favorites/entities/unit-favorite.entity';
