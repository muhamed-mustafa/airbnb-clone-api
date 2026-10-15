import { modelNames } from '@common/constants/model-names.constant';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';

@Schema({ timestamps: true })
export class Unit {
  @Prop({ required: true, trim: true })
  title!: string;

  @Prop({ required: true, trim: true })
  description!: string;

  @Prop({ required: true, trim: true })
  address!: string;

  @Prop({ type: [String], required: true, trim: true })
  photos!: string[];

  @Prop({ required: true, min: 1 })
  costPerDay!: number;

  @Prop({ type: Types.ObjectId, required: true, ref: modelNames.COUNTRIES })
  country!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, required: true, ref: modelNames.CITIES })
  city!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, required: true, ref: modelNames.UNIT_CATEGORIES })
  unitCategory!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, required: true, ref: modelNames.USERS })
  user!: Types.ObjectId;

  @Prop({ required: true, min: 1 })
  roomsCount!: number;

  @Prop({ required: true, min: 1 })
  adultsCount!: number;

  @Prop({ required: true, min: 1 })
  kidsCount!: number;

  @Prop({ required: true, default: false })
  hasInternetService!: boolean;

  @Prop({ required: true, default: false })
  hasKitchen!: boolean;

  @Prop({ required: true, default: false })
  hasPrivateGarage!: boolean;

  @Prop({ required: true, default: true })
  availability!: boolean;

  @Prop({ required: true, default: true })
  isActive!: boolean;

  @Prop({ default: false })
  isDeleted?: boolean;

  @Prop()
  deletedAt?: Date;
}

export const UnitSchema = SchemaFactory.createForClass(Unit);
