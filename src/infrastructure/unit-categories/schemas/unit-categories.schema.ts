import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({ timestamps: true })
export class UnitCategory {
  @Prop({ required: true, lowercase: true, trim: true })
  name!: string;

  @Prop({ default: '', trim: true })
  icon?: string;

  @Prop({ default: false })
  isDeleted?: boolean;

  @Prop()
  deletedAt?: Date;
}

export const UnitCategorySchema = SchemaFactory.createForClass(UnitCategory);

UnitCategorySchema.index(
  { name: 1 },
  {
    unique: true,
    partialFilterExpression: { isDeleted: false },
  },
);
