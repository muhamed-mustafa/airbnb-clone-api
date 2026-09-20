import { ConflictException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CountryEntity } from '../../../application/countries/entities/country.entity';
import { CreateCountryInput } from '../../../application/countries/inputs/create-country.input';
import { UpdateCountryInput } from '../../../application/countries/inputs/update-country.input';
import { CountryFilter } from '../../../application/countries/repositories/country-filter';
import { CountryRepository } from '../../../application/countries/repositories/country.repository';
import { ERROR_CODES } from '../../../common/errors/error-codes';
import { CountryMapper } from '../mappers/country.mapper';
import { getDuplicateKeyField } from '../../database/is-duplicate-key-error';
import { Country } from '../schemas/countries.schema';

@Injectable()
export class MongooseCountryRepository implements CountryRepository {
  constructor(@InjectModel(Country.name) private readonly countryModel: Model<Country>) {}

  async existsByNameOrCode(name: string, code: string): Promise<boolean> {
    const exists = await this.countryModel.exists({ $or: [{ name }, { code }], isDeleted: false });
    return exists !== null;
  }

  async create(data: CreateCountryInput): Promise<CountryEntity> {
    try {
      const country = await this.countryModel.create(data);
      return CountryMapper.toEntity(country);
    } catch (error: unknown) {
      const duplicateField = getDuplicateKeyField(error);

      if (duplicateField === 'name' || duplicateField === 'code') {
        throw new ConflictException({
          code: ERROR_CODES.COUNTRY_ALREADY_EXISTS,
          field: duplicateField,
        });
      }

      throw error;
    }
  }

  async find(filter: CountryFilter): Promise<CountryEntity[]> {
    const { page = 1, limit = 10, name, code } = filter;

    const escapedName = name?.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

    const countries = await this.countryModel
      .find({
        ...(code !== undefined ? { code } : {}),
        ...(escapedName ? { name: { $regex: escapedName, $options: 'i' } } : {}),
        isDeleted: false,
      })
      .sort({ name: 1, _id: 1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .exec();

    return countries.map((country) => CountryMapper.toEntity(country));
  }

  async findById(id: string): Promise<CountryEntity | null> {
    const country = await this.countryModel.findOne({ _id: id, isDeleted: false }).exec();
    return country ? CountryMapper.toEntity(country) : null;
  }

  async findOne(filter: CountryFilter): Promise<CountryEntity | null> {
    const country = await this.countryModel
      .findOne({
        ...(filter.name !== undefined ? { name: filter.name } : {}),
        ...(filter.code !== undefined ? { code: filter.code } : {}),
        isDeleted: false,
      })
      .exec();
    return country ? CountryMapper.toEntity(country) : null;
  }

  async update(id: string, data: UpdateCountryInput): Promise<CountryEntity | null> {
    try {
      const country = await this.countryModel
        .findOneAndUpdate(
          { _id: id, isDeleted: false },
          { $set: data },
          { returnDocument: 'after', runValidators: true },
        )
        .exec();

      return country ? CountryMapper.toEntity(country) : null;
    } catch (error: unknown) {
      const duplicateField = getDuplicateKeyField(error);

      if (duplicateField === 'name' || duplicateField === 'code') {
        throw new ConflictException({
          code: ERROR_CODES.COUNTRY_ALREADY_EXISTS,
          field: duplicateField,
        });
      }

      throw error;
    }
  }

  async delete(id: string): Promise<void> {
    await this.countryModel
      .updateOne(
        { _id: id, isDeleted: false },
        { $set: { isDeleted: true, deletedAt: new Date() } },
      )
      .exec();
  }
}
