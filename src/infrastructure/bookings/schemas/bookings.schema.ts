import { BookingStatus } from '@application/bookings/enums/booking-status.enum';
import { modelNames } from '@common/constants/model-names.constant';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';

@Schema({ timestamps: true })
export class Booking {
  @Prop({ type: Types.ObjectId, required: true, ref: modelNames.UNITS })
  unit!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, required: true, ref: modelNames.USERS })
  guest!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, required: true, ref: modelNames.USERS })
  host!: Types.ObjectId;

  @Prop({ required: true, type: Date })
  checkIn!: Date;

  @Prop({ required: true, type: Date })
  checkOut!: Date;

  @Prop({ required: true, min: 1 })
  daysCount!: number;

  @Prop({ required: true, min: 0 })
  pricePerDay!: number;

  @Prop({ required: true, min: 0 })
  bookingAmount!: number;

  @Prop({ required: true, min: 0 })
  vatAmount!: number;

  @Prop({ required: true, min: 0 })
  totalAmount!: number;

  @Prop({ required: true, default: 'EGP' })
  currency!: string;

  @Prop({ required: true, min: 1, default: 1 })
  adultsCount!: number;

  @Prop({ required: true, min: 0, default: 0 })
  kidsCount!: number;

  @Prop({ trim: true, maxlength: 1000 })
  notes?: string;

  @Prop({ type: String, enum: BookingStatus, default: BookingStatus.PENDING })
  status!: BookingStatus;

  @Prop({ trim: true, maxlength: 500 })
  cancellationReason?: string;
}

export const BookingSchema = SchemaFactory.createForClass(Booking);

BookingSchema.index({ unit: 1, status: 1, checkIn: 1 });
