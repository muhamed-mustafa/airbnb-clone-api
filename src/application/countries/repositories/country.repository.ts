import { CountryEntity } from '../entities/country.entity';
import { CreateCountryInput } from '../inputs/create-country.input';
import { UpdateCountryInput } from '../inputs/update-country.input';
import { CountryFilter } from './country-filter';

export interface CountryRepository {
  create(country: CreateCountryInput): Promise<CountryEntity>;
  existsByNameOrCode(name: string, code: string): Promise<boolean>;
  find(filter: CountryFilter): Promise<CountryEntity[]>;
  findById(id: string): Promise<CountryEntity | null>;
  findOne(filter: CountryFilter): Promise<CountryEntity | null>;
  update(id: string, country: UpdateCountryInput): Promise<CountryEntity | null>;
  delete(id: string): Promise<void>;
}
