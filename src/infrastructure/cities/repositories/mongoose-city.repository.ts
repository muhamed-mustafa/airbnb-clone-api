import { CityEntity } from '@application/cities/entities/city.entity';
import { CreateCityInput } from '@application/cities/inputs/create-city.input';
import { UpdateCityInput } from '@application/cities/inputs/update-city.input';
import { CityFilter } from '@application/cities/repositories/city-filter';
import { CityRepository } from '@application/cities/repositories/city.repository';
import { ERROR_CODES } from '@common/errors/error-codes';
import type { TransactionSession } from '@common/transactions/transaction-runner';
import { ConflictException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { isDuplicateKeyError } from '../../database/is-duplicate-key-error';
import { toClientSession } from '../../database/mongoose-transaction-runner';
import { CityMapper } from '../mappers/city.mapper';
import { City } from '../schemas/cities.schema';

// The { country, name } index is compound, so both keys identify a duplicate city.
const isDuplicateCityError = (error: unknown): boolean =>
  isDuplicateKeyError(error) && 'country' in error.keyPattern && 'name' in error.keyPattern;

@Injectable()
export class MongooseCityRepository implements CityRepository {
  constructor(@InjectModel(City.name) private readonly cityModel: Model<City>) {}

  async existsByCountryAndName(country: string, name: string): Promise<boolean> {
    const exists = await this.cityModel.exists({ country, name, isDeleted: false });
    return exists !== null;
  }

  async create(data: CreateCityInput): Promise<CityEntity> {
    try {
      const city = await this.cityModel.create(data);
      return CityMapper.toEntity(city);
    } catch (error: unknown) {
      if (isDuplicateCityError(error)) {
        throw new ConflictException({ code: ERROR_CODES.CITY_ALREADY_EXISTS, field: 'name' });
      }

      throw error;
    }
  }

  async find(filter: CityFilter): Promise<{ items: CityEntity[]; total: number }> {
    const { page = 1, limit = 10, name, country } = filter;

    const escapedName = name?.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

    const query = {
      ...(country !== undefined ? { country } : {}),
      ...(escapedName ? { name: { $regex: escapedName, $options: 'i' } } : {}),
      isDeleted: false,
    };

    const [cities, total] = await Promise.all([
      this.cityModel
        .find(query)
        .sort({ name: 1, _id: 1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .exec(),

      this.cityModel.countDocuments(query),
    ]);

    return {
      items: cities.map((city) => CityMapper.toEntity(city)),
      total,
    };
  }

  async findById(id: string): Promise<CityEntity | null> {
    const city = await this.cityModel.findOne({ _id: id, isDeleted: false }).exec();
    return city ? CityMapper.toEntity(city) : null;
  }

  async update(id: string, data: UpdateCityInput): Promise<CityEntity | null> {
    try {
      const city = await this.cityModel
        .findOneAndUpdate(
          { _id: id, isDeleted: false },
          { $set: data },
          { returnDocument: 'after', runValidators: true },
        )
        .exec();

      return city ? CityMapper.toEntity(city) : null;
    } catch (error: unknown) {
      if (isDuplicateCityError(error)) {
        throw new ConflictException({ code: ERROR_CODES.CITY_ALREADY_EXISTS, field: 'name' });
      }

      throw error;
    }
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.cityModel
      .updateOne(
        { _id: id, isDeleted: false },
        { $set: { isDeleted: true, deletedAt: new Date() } },
      )
      .exec();

    return result.modifiedCount > 0;
  }

  async deleteByCountry(country: string, session?: TransactionSession): Promise<number> {
    const result = await this.cityModel
      .updateMany(
        { country, isDeleted: false },
        { $set: { isDeleted: true, deletedAt: new Date() } },
        { session: toClientSession(session) },
      )
      .exec();

    return result.modifiedCount;
  }
}
