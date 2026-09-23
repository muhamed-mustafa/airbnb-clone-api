import { CityEntity } from '../entities/city.entity';

export type CityFilter = Partial<Pick<CityEntity, 'name' | 'country'>> & {
  page?: number;
  limit?: number;
};
