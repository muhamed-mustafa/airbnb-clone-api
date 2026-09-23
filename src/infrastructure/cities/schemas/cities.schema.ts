import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { Country } from '../../countries/schemas/countries.schema';

@Schema({ timestamps: true })
export class City {
  @Prop({ required: true, lowercase: true, trim: true })
  name!: string;

  @Prop({ type: Types.ObjectId, required: true, ref: Country.name })
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
  },
);
