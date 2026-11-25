import type {
  UnitFavoriteEntity,
  UnitFavoritePage,
} from '@application/favorites/entities/unit-favorite.entity';
import type { UnitFavoriteRepository } from '@application/favorites/repositories/unit-favorite.repository';
import { modelNames } from '@common/constants/model-names.constant';
import { UnitFavorite } from '@infrastructure/favorites/schemas/unit-favorite.schema';
import { UnitMapper } from '@infrastructure/units/mappers/unit.mapper';
import { Unit } from '@infrastructure/units/schemas/units.schema';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types, type HydratedDocument } from 'mongoose';

type UnitFavoriteWithUnit = HydratedDocument<UnitFavorite> & {
  unit: HydratedDocument<Unit>;
};

@Injectable()
export class MongooseUnitFavoriteRepository implements UnitFavoriteRepository {
  constructor(
    @InjectModel(modelNames.UNIT_FAVORITES)
    private readonly favoriteModel: Model<UnitFavorite>,
  ) {}

  async add(userId: string, unitId: string): Promise<UnitFavoriteEntity> {
    const user = new Types.ObjectId(userId);
    const unit = new Types.ObjectId(unitId);
    const favorite = await this.favoriteModel
      .findOneAndUpdate(
        { user, unit },
        { $setOnInsert: { user, unit } },
        { new: true, upsert: true },
      )
      .populate<{ unit: HydratedDocument<Unit> }>('unit')
      .exec();

    if (!favorite) throw new Error('Favorite upsert returned no document.');

    return this.toEntity(favorite as UnitFavoriteWithUnit);
  }

  async findForUser(userId: string, page: number, limit: number): Promise<UnitFavoritePage> {
    const filter = { user: new Types.ObjectId(userId) };
    const [favorites, total] = await Promise.all([
      this.favoriteModel
        .find(filter)
        .sort({ createdAt: -1, _id: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .populate<{ unit: HydratedDocument<Unit> }>('unit')
        .exec(),
      this.favoriteModel.countDocuments(filter).exec(),
    ]);

    return {
      items: favorites.map((favorite) => this.toEntity(favorite as UnitFavoriteWithUnit)),
      total,
    };
  }

  async remove(userId: string, unitId: string): Promise<void> {
    await this.favoriteModel
      .deleteOne({ user: new Types.ObjectId(userId), unit: new Types.ObjectId(unitId) })
      .exec();
  }

  private toEntity(favorite: UnitFavoriteWithUnit): UnitFavoriteEntity {
    return {
      id: favorite._id.toString(),
      user: favorite.user.toString(),
      unit: UnitMapper.toEntity(favorite.unit),
      createdAt: favorite.createdAt,
    };
  }
}
