import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { CASE_INSENSITIVE_COLLATION } from '../../database/collation';

@Schema({ timestamps: true })
export class Country {
  @Prop({ required: true, trim: true })
  name!: string;

  @Prop({ required: true, trim: true })
  code!: string;

  @Prop({ default: false })
  isDeleted?: boolean;

  @Prop()
  deletedAt?: Date;
}

export const CountrySchema = SchemaFactory.createForClass(Country);

CountrySchema.index(
  { name: 1 },
  {
    unique: true,
    partialFilterExpression: { isDeleted: false },
    collation: CASE_INSENSITIVE_COLLATION,
  },
);

CountrySchema.index(
  { code: 1 },
  {
    unique: true,
    partialFilterExpression: { isDeleted: false },
  },
);
