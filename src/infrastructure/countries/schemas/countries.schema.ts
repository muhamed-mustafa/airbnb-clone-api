import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({ timestamps: true })
export class Country {
  @Prop({ required: true, lowercase: true, trim: true })
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
  },
);

CountrySchema.index(
  { code: 1 },
  {
    unique: true,
    partialFilterExpression: { isDeleted: false },
  },
);
