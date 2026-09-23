import type { TransactionSession } from '@common/transactions/transaction-runner';
import { CityEntity } from '../entities/city.entity';
import { CreateCityInput } from '../inputs/create-city.input';
import { UpdateCityInput } from '../inputs/update-city.input';
import { CityFilter } from './city-filter';

export interface CityRepository {
  create(city: CreateCityInput): Promise<CityEntity>;
  existsByCountryAndName(country: string, name: string): Promise<boolean>;
  find(filter: CityFilter): Promise<{ items: CityEntity[]; total: number }>;
  findById(id: string): Promise<CityEntity | null>;
  update(id: string, city: UpdateCityInput): Promise<CityEntity | null>;
  delete(id: string): Promise<boolean>;
  deleteByCountry(country: string, session?: TransactionSession): Promise<number>;
}
