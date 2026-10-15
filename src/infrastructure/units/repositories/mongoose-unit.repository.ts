import { UnitEntity } from '@application/units/entities/unit-entity';
import { CreateUnitInput } from '@application/units/inputs/create-unit.input';
import { UpdateUnitInput } from '@application/units/inputs/update-unit.input';
import { UnitFilter } from '@application/units/repositories/unit-filter';
import type { UnitRepository } from '@application/units/repositories/unit.repository';
import { modelNames } from '@common/constants/model-names.constant';
import { UnitMapper } from '@infrastructure/units/mappers/unit.mapper';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, type QueryFilter } from 'mongoose';
import { Unit } from '../schemas/units.schema';

@Injectable()
export class MongooseUnitRepository implements UnitRepository {
  constructor(
    @InjectModel(modelNames.UNITS)
    private readonly unitModel: Model<Unit>,
  ) {}

  async create(data: CreateUnitInput): Promise<UnitEntity> {
    const unit = await this.unitModel.create(data);
    return UnitMapper.toEntity(unit);
  }

  async findOne(query: Partial<UnitEntity>): Promise<UnitEntity | null> {
    const { id, ...filters } = query;
    const unit = await this.unitModel.findOne({
      ...filters,
      ...(id !== undefined ? { _id: id } : {}),
      isDeleted: false,
    });
    return unit ? UnitMapper.toEntity(unit) : null;
  }

  async find(filter: UnitFilter): Promise<{ items: UnitEntity[]; total: number }> {
    const {
      page = 1,
      limit = 10,
      title,
      minPrice,
      maxPrice,
      adultsCount,
      city,
      country,
      hasInternetService,
      hasKitchen,
      hasPrivateGarage,
      kidsCount,
      unitCategory,
      roomsCount,
      availability,
      user,
      isActive,
    } = filter;

    const searchTerm = title?.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

    const query: QueryFilter<Unit> = {
      isDeleted: false,
      ...(title?.trim()
        ? {
            $or: [
              {
                title: {
                  $regex: searchTerm,
                  $options: 'i',
                },
              },
              {
                description: {
                  $regex: searchTerm,
                  $options: 'i',
                },
              },
            ],
          }
        : {}),
      ...(minPrice !== undefined || maxPrice !== undefined
        ? {
            costPerDay: {
              ...(minPrice !== undefined ? { $gte: minPrice } : {}),
              ...(maxPrice !== undefined ? { $lte: maxPrice } : {}),
            },
          }
        : {}),
      ...(adultsCount !== undefined ? { adultsCount } : {}),
      ...(kidsCount !== undefined ? { kidsCount } : {}),
      ...(city !== undefined ? { city } : {}),
      ...(country !== undefined ? { country } : {}),
      ...(unitCategory !== undefined ? { unitCategory } : {}),
      ...(hasInternetService !== undefined ? { hasInternetService } : {}),
      ...(hasKitchen !== undefined ? { hasKitchen } : {}),
      ...(hasPrivateGarage !== undefined ? { hasPrivateGarage } : {}),
      ...(roomsCount !== undefined ? { roomsCount } : {}),
      ...(availability !== undefined ? { availability } : {}),
      ...(user !== undefined ? { user } : {}),
      ...(isActive !== undefined ? { isActive } : {}),
    };

    const [units, total] = await Promise.all([
      this.unitModel
        .find(query)
        .sort({ costPerDay: 1, _id: 1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .exec(),

      this.unitModel.countDocuments(query).exec(),
    ]);

    return {
      items: units.map((unit) => UnitMapper.toEntity(unit)),
      total,
    };
  }

  async update(id: string, data: UpdateUnitInput): Promise<UnitEntity | null> {
    const unit = await this.unitModel
      .findOneAndUpdate(
        { _id: id, isDeleted: false },
        { $set: data },
        { returnDocument: 'after', runValidators: true },
      )
      .exec();

    return unit ? UnitMapper.toEntity(unit) : null;
  }
  async activate(id: string): Promise<UnitEntity | null> {
    return this.setActive(id, true);
  }
  async deactivate(id: string): Promise<UnitEntity | null> {
    return this.setActive(id, false);
  }
  private async setActive(id: string, isActive: boolean): Promise<UnitEntity | null> {
    const unit = await this.unitModel
      .findOneAndUpdate(
        { _id: id, isDeleted: false },
        { $set: { isActive } },
        { returnDocument: 'after' },
      )
      .exec();
    return unit ? UnitMapper.toEntity(unit) : null;
  }
  async delete(id: string): Promise<boolean> {
    const result = await this.unitModel
      .updateOne(
        { _id: id, isDeleted: false },
        { $set: { isDeleted: true, isActive: false, deletedAt: new Date() } },
      )
      .exec();
    return result.modifiedCount > 0;
  }
}
