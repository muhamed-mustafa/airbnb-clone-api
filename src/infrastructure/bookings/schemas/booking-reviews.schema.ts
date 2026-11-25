import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';

@Schema({ timestamps: true })
export class BookingReview {
  _id!: Types.ObjectId;

  @Prop({ required: true, min: 1, max: 5, type: Number })
  rating!: number;

  @Prop({ trim: true, maxlength: 1000 })
  comment?: string;

  createdAt!: Date;
  updatedAt!: Date;
}

export const BookingReviewSchema = SchemaFactory.createForClass(BookingReview);
