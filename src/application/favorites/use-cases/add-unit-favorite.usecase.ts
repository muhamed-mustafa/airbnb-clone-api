import type { UnitFavoriteEntity } from '@application/favorites/entities/unit-favorite.entity';
import { UNIT_FAVORITE_REPOSITORY } from '@application/favorites/repositories/unit-favorite-repository.token';
import type { UnitFavoriteRepository } from '@application/favorites/repositories/unit-favorite.repository';
import { UnitService } from '@application/units/services/unit.service';
import { Inject, Injectable } from '@nestjs/common';

@Injectable()
export class AddUnitFavoriteUseCase {
  constructor(
    private readonly unitService: UnitService,
    @Inject(UNIT_FAVORITE_REPOSITORY)
    private readonly favoriteRepository: UnitFavoriteRepository,
  ) {}

  async execute(userId: string, unitId: string): Promise<UnitFavoriteEntity> {
    const unit = await this.unitService.findOne({ id: unitId, isActive: true });
    return this.favoriteRepository.add(userId, unit.id);
  }
}
