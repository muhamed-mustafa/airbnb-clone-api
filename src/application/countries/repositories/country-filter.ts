import { CountryEntity } from '../entities/country.entity';
export type CountryFilter = Partial<Pick<CountryEntity, 'name' | 'code'>> & {
  isDeleted?: boolean;
  page?: number;
  limit?: number;
};
