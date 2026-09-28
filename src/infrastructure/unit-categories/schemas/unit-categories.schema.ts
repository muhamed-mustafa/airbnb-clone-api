import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { CASE_INSENSITIVE_COLLATION } from '../../database/collation';

@Schema({ timestamps: true })
export class UnitCategory {
  @Prop({ required: true, trim: true })
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
    collation: CASE_INSENSITIVE_COLLATION,
  },
);
