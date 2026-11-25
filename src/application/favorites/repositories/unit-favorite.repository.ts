import type {
  UnitFavoriteEntity,
  UnitFavoritePage,
} from '@application/favorites/entities/unit-favorite.entity';

export interface UnitFavoriteRepository {
  add(userId: string, unitId: string): Promise<UnitFavoriteEntity>;
  findForUser(userId: string, page: number, limit: number): Promise<UnitFavoritePage>;
  remove(userId: string, unitId: string): Promise<void>;
}
