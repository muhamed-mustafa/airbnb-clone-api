import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({ timestamps: true })
export class Country {
  @Prop({ required: true, unique: true, lowercase: true, trim: true })
  name!: string;

  @Prop({ required: true, unique: true, trim: true })
  code!: string;

  @Prop({ default: false })
  isDeleted?: boolean;

  @Prop()
  deletedAt?: Date;
}

export const CountrySchema = SchemaFactory.createForClass(Country);
