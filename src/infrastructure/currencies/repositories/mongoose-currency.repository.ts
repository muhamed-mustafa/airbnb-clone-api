import { CurrencyEntity } from '@application/currencies/entities/currency.entity';
import { CreateCurrencyInput } from '@application/currencies/inputs/create-currency.input';
import { UpdateCurrencyInput } from '@application/currencies/inputs/update-currency.input';
import { CurrencyFilter } from '@application/currencies/repositories/currency-filter';
import { CurrencyRepository } from '@application/currencies/repositories/currency.repository';
import { ERROR_CODES } from '@common/errors/error-codes';
import { ConflictException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { getDuplicateKeyField } from '../../database/is-duplicate-key-error';
import { CurrencyMapper } from '../mappers/currency.mapper';
import { Currency } from '../schemas/currencies.schema';

@Injectable()
export class MongooseCurrencyRepository implements CurrencyRepository {
  constructor(@InjectModel(Currency.name) private readonly currencyModel: Model<Currency>) {}

  async existsByNameOrCode(name: string, currencyCode: string): Promise<boolean> {
    const exists = await this.currencyModel.exists({
      $or: [{ name }, { currencyCode }],
      isDeleted: false,
    });
    return exists !== null;
  }

  async create(data: CreateCurrencyInput): Promise<CurrencyEntity> {
    try {
      const currency = await this.currencyModel.create(data);
      return CurrencyMapper.toEntity(currency);
    } catch (error: unknown) {
      const duplicateField = getDuplicateKeyField(error);

      if (duplicateField === 'name' || duplicateField === 'currencyCode') {
        throw new ConflictException({
          code: ERROR_CODES.CURRENCY_ALREADY_EXISTS,
          field: duplicateField,
        });
      }

      throw error;
    }
  }

  async find(filter: CurrencyFilter): Promise<{ items: CurrencyEntity[]; total: number }> {
    const { page = 1, limit = 10, name, currencyCode } = filter;

    const escapedName = name?.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

    const query = {
      ...(currencyCode !== undefined ? { currencyCode } : {}),
      ...(escapedName ? { name: { $regex: escapedName, $options: 'i' } } : {}),
      isDeleted: false,
    };

    const [currencies, total] = await Promise.all([
      this.currencyModel
        .find(query)
        .sort({ name: 1, _id: 1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .exec(),

      this.currencyModel.countDocuments(query),
    ]);

    return {
      items: currencies.map((currency) => CurrencyMapper.toEntity(currency)),
      total,
    };
  }

  async findById(id: string): Promise<CurrencyEntity | null> {
    const currency = await this.currencyModel.findOne({ _id: id, isDeleted: false }).exec();
    return currency ? CurrencyMapper.toEntity(currency) : null;
  }

  async update(id: string, data: UpdateCurrencyInput): Promise<CurrencyEntity | null> {
    try {
      const currency = await this.currencyModel
        .findOneAndUpdate(
          { _id: id, isDeleted: false },
          { $set: data },
          { returnDocument: 'after', runValidators: true },
        )
        .exec();

      return currency ? CurrencyMapper.toEntity(currency) : null;
    } catch (error: unknown) {
      const duplicateField = getDuplicateKeyField(error);

      if (duplicateField === 'name' || duplicateField === 'currencyCode') {
        throw new ConflictException({
          code: ERROR_CODES.CURRENCY_ALREADY_EXISTS,
          field: duplicateField,
        });
      }

      throw error;
    }
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.currencyModel
      .updateOne(
        { _id: id, isDeleted: false },
        { $set: { isDeleted: true, deletedAt: new Date() } },
      )
      .exec();

    return result.modifiedCount > 0;
  }
}
