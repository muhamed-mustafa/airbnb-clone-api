import type { UnitEntity } from '@application/units/entities/unit-entity';

export interface UnitFavoriteEntity {
  id: string;
  user: string;
  unit: UnitEntity;
  createdAt: Date;
}

export interface UnitFavoritePage {
  items: UnitFavoriteEntity[];
  total: number;
}
