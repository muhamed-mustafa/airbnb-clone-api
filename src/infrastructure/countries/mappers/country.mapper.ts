import type { HydratedDocument } from 'mongoose';
import type { CountryEntity } from '../../../application/countries/entities/country.entity';
import type { Country } from '../schemas/countries.schema';

export class CountryMapper {
  static toEntity(country: HydratedDocument<Country>): CountryEntity {
    return {
      id: country._id.toString(),
      name: country.name,
      code: country.code,
    };
  }
}
