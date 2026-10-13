import { UnitEntity } from '../entities/unit-entity';
export type UnitFilter = Partial<
  Pick<
    UnitEntity,
    | 'user'
    | 'title'
    | 'unitCategory'
    | 'country'
    | 'city'
    | 'adultsCount'
    | 'kidsCount'
    | 'hasInternetService'
    | 'hasKitchen'
    | 'hasPrivateGarage'
    | 'availability'
    | 'roomsCount'
  >
> & {
  minPrice?: number;
  maxPrice?: number;
  isDeleted?: boolean;
  page?: number;
  limit?: number;
};
