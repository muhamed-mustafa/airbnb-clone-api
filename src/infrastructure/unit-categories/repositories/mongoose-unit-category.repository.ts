import { UnitCategoryEntity } from '@application/unit-categories/entities/unit-category.entity';
import { CreateUnitCategoryInput } from '@application/unit-categories/inputs/create-unit-category.input';
import { UpdateUnitCategoryInput } from '@application/unit-categories/inputs/update-unit-category.input';
import { UnitCategoryFilter } from '@application/unit-categories/repositories/unit-category-filter';
import { UnitCategoryRepository } from '@application/unit-categories/repositories/unit-category.repository';
import { ERROR_CODES } from '@common/errors/error-codes';
import { ConflictException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { getDuplicateKeyField } from '../../database/is-duplicate-key-error';
import { UnitCategoryMapper } from '../mappers/unit-category.mapper';
import { UnitCategory } from '../schemas/unit-categories.schema';

@Injectable()
export class MongooseUnitCategoryRepository implements UnitCategoryRepository {
  constructor(
    @InjectModel(UnitCategory.name) private readonly unitCategoryModel: Model<UnitCategory>,
  ) {}

  async existsByName(name: string): Promise<boolean> {
    const exists = await this.unitCategoryModel.exists({ name, isDeleted: false });
    return exists !== null;
  }

  async create(data: CreateUnitCategoryInput): Promise<UnitCategoryEntity> {
    try {
      const unitCategory = await this.unitCategoryModel.create(data);
      return UnitCategoryMapper.toEntity(unitCategory);
    } catch (error: unknown) {
      const duplicateField = getDuplicateKeyField(error);

      if (duplicateField === 'name') {
        throw new ConflictException({
          code: ERROR_CODES.UNIT_CATEGORY_ALREADY_EXISTS,
          field: duplicateField,
        });
      }

      throw error;
    }
  }

  async find(filter: UnitCategoryFilter): Promise<{ items: UnitCategoryEntity[]; total: number }> {
    const { page = 1, limit = 10, name } = filter;

    const escapedName = name?.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

    const query = {
      ...(escapedName ? { name: { $regex: escapedName, $options: 'i' } } : {}),
      isDeleted: false,
    };

    const [unitCategories, total] = await Promise.all([
      this.unitCategoryModel
        .find(query)
        .sort({ name: 1, _id: 1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .exec(),

      this.unitCategoryModel.countDocuments(query),
    ]);

    return {
      items: unitCategories.map((unitCategory) => UnitCategoryMapper.toEntity(unitCategory)),
      total,
    };
  }

  async findById(id: string): Promise<UnitCategoryEntity | null> {
    const unitCategory = await this.unitCategoryModel.findOne({ _id: id, isDeleted: false }).exec();
    return unitCategory ? UnitCategoryMapper.toEntity(unitCategory) : null;
  }

  async update(id: string, data: UpdateUnitCategoryInput): Promise<UnitCategoryEntity | null> {
    try {
      const unitCategory = await this.unitCategoryModel
        .findOneAndUpdate(
          { _id: id, isDeleted: false },
          { $set: data },
          { returnDocument: 'after', runValidators: true },
        )
        .exec();

      return unitCategory ? UnitCategoryMapper.toEntity(unitCategory) : null;
    } catch (error: unknown) {
      const duplicateField = getDuplicateKeyField(error);

      if (duplicateField === 'name') {
        throw new ConflictException({
          code: ERROR_CODES.UNIT_CATEGORY_ALREADY_EXISTS,
          field: duplicateField,
        });
      }

      throw error;
    }
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.unitCategoryModel
      .updateOne(
        { _id: id, isDeleted: false },
        { $set: { isDeleted: true, deletedAt: new Date() } },
      )
      .exec();

    return result.modifiedCount > 0;
  }
}
