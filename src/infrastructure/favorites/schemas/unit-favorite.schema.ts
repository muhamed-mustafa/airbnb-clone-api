import { modelNames } from '@common/constants/model-names.constant';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';

@Schema({ timestamps: true })
export class UnitFavorite {
  @Prop({ required: true, type: Types.ObjectId, ref: modelNames.UNITS })
  unit!: Types.ObjectId;

  @Prop({ required: true, type: Types.ObjectId, ref: modelNames.USERS })
  user!: Types.ObjectId;

  createdAt!: Date;
  updatedAt!: Date;
}

export const UnitFavoriteSchema = SchemaFactory.createForClass(UnitFavorite);

UnitFavoriteSchema.index({ user: 1, unit: 1 }, { unique: true, name: 'uniq_user_unit_favorite' });
UnitFavoriteSchema.index({ user: 1, createdAt: -1, _id: -1 }, { name: 'user_favorites_recent' });
