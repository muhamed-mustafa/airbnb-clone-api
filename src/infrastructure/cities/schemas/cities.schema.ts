import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { CASE_INSENSITIVE_COLLATION } from '../../database/collation';
import { modelNames } from '@common/constants/model-names.constant';

@Schema({ timestamps: true })
export class City {
  @Prop({ required: true, trim: true })
  name!: string;

  @Prop({ type: Types.ObjectId, required: true, ref: modelNames.COUNTRIES })
  country!: Types.ObjectId;

  @Prop({ default: false })
  isDeleted?: boolean;

  @Prop()
  deletedAt?: Date;
}

export const CitySchema = SchemaFactory.createForClass(City);

// City names are unique per country, not globally; soft-deleted cities free the pair.
CitySchema.index(
  { country: 1, name: 1 },
  {
    unique: true,
    partialFilterExpression: { isDeleted: false },
    collation: CASE_INSENSITIVE_COLLATION,
  },
);
