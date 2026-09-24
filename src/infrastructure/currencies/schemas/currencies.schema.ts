import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({ timestamps: true })
export class Currency {
  @Prop({ required: true, lowercase: true, trim: true })
  name!: string;

  @Prop({ required: true, trim: true })
  currencyCode!: string;

  @Prop({ default: false })
  isDeleted?: boolean;

  @Prop()
  deletedAt?: Date;
}

export const CurrencySchema = SchemaFactory.createForClass(Currency);

CurrencySchema.index(
  { name: 1 },
  {
    unique: true,
    partialFilterExpression: { isDeleted: false },
  },
);

CurrencySchema.index(
  { currencyCode: 1 },
  {
    unique: true,
    partialFilterExpression: { isDeleted: false },
  },
);
