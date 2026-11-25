import type { UnitFavoriteEntity } from '@application/favorites/entities/unit-favorite.entity';
import { UnitMapper } from '@presentation/units/mappers/unit.mapper';
import { UnitFavoriteResponseDto } from '@presentation/favorites/dtos/unit-favorite-response.dto';

export class UnitFavoriteMapper {
  static toResponse(favorite: UnitFavoriteEntity): UnitFavoriteResponseDto {
    return {
      id: favorite.id,
      unit: UnitMapper.toResponse(favorite.unit),
      createdAt: favorite.createdAt,
    };
  }
}
