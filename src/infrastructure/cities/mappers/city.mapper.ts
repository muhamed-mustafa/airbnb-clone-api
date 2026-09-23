import type { HydratedDocument } from 'mongoose';
import type { CityEntity } from '@application/cities/entities/city.entity';
import type { City } from '../schemas/cities.schema';

export class CityMapper {
  static toEntity(city: HydratedDocument<City>): CityEntity {
    return {
      id: city._id.toString(),
      name: city.name,
      country: city.country.toString(),
    };
  }
}
