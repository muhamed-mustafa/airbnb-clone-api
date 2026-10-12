import { UnitEntity } from '@application/units/entities/unit-entity';
import { CreateUnitInput } from '@application/units/inputs/create-unit.input';
import { UpdateUnitInput } from '@application/units/inputs/update-unit.input';
import type { UnitRepository } from '@application/units/repositories/unit.repository';
import { modelNames } from '@common/constants/model-names.constant';
import { UnitMapper } from '@infrastructure/units/mappers/unit.mapper';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Unit } from '../schemas/units.schema';

@Injectable()
export class MongooseUnitRepository implements UnitRepository {
  constructor(
    @InjectModel(modelNames.UNITS)
    private readonly unitModel: Model<Unit>,
  ) {}

  async create(data: CreateUnitInput): Promise<UnitEntity> {
    const unit = await this.unitModel.create(data);

    return {
      id: unit._id.toString(),
      user: unit.user.toString(),
      title: unit.title,
      description: unit.description,
      address: unit.address,
      photos: unit.photos,
      costPerDay: unit.costPerDay,
      country: unit.country.toString(),
      city: unit.city.toString(),
      unitCategory: unit.unitCategory.toString(),
      roomsCount: unit.roomsCount,
      adultsCount: unit.adultsCount,
      kidsCount: unit.kidsCount,
      hasInternetService: unit.hasInternetService,
      hasKitchen: unit.hasKitchen,
      hasPrivateGarage: unit.hasPrivateGarage,
      availability: unit.availability,
    };
  }

  async findOne(query: Partial<UnitEntity>): Promise<UnitEntity | null> {
    const unit = await this.unitModel.findOne(query);
    return unit ? UnitMapper.toEntity(unit) : null;
  }

  async update(id: string, data: UpdateUnitInput): Promise<UnitEntity | null> {
    const unit = await this.unitModel
      .findOneAndUpdate(
        { _id: id, isDeleted: false },
        { $set: data },
        { new: true, returnDocument: 'after' },
      )
      .exec();

    return unit ? UnitMapper.toEntity(unit) : null;
  }
}
