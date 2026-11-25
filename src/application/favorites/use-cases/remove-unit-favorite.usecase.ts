import { UNIT_FAVORITE_REPOSITORY } from '@application/favorites/repositories/unit-favorite-repository.token';
import type { UnitFavoriteRepository } from '@application/favorites/repositories/unit-favorite.repository';
import { Inject, Injectable } from '@nestjs/common';

@Injectable()
export class RemoveUnitFavoriteUseCase {
  constructor(
    @Inject(UNIT_FAVORITE_REPOSITORY)
    private readonly favoriteRepository: UnitFavoriteRepository,
  ) {}

  async execute(userId: string, unitId: string): Promise<void> {
    await this.favoriteRepository.remove(userId, unitId);
  }
}
