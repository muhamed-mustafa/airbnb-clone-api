import type { BookingEntity } from '@application/bookings/entities/booking.entity';
import type { CreateBookingRecordInput } from '@application/bookings/inputs/create-booking-record.input';
import type { BookingRepository } from '@application/bookings/repositories/booking.repository';
import type { OverlappingBookingsFilter } from '@application/bookings/repositories/booking-filter';
import { modelNames } from '@common/constants/model-names.constant';
import { Booking } from '@infrastructure/bookings/schemas/bookings.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

export class MongooseBookingAvailabilityRepository implements BookingRepository {
  constructor(@InjectModel(modelNames.BOOKINGS) private readonly bookingModel: Model<Booking>) {}

  async find(filter: OverlappingBookingsFilter): Promise<BookingEntity[]> {
    const bookings = await this.bookingModel
      .find({
        unit: new Types.ObjectId(filter.unit),
        status: filter.status,
        checkIn: filter.checkIn,
        checkOut: filter.checkOut,
      })
      .lean()
      .exec();

    return bookings.map((booking) => this.toEntity(booking));
  }

  async create(input: CreateBookingRecordInput): Promise<BookingEntity> {
    const booking = await this.bookingModel.create(input);
    return this.toEntity(booking);
  }

  private toEntity(booking: Booking & { _id: Types.ObjectId }): BookingEntity {
    return {
      id: booking._id.toString(),
      unit: booking.unit.toString(),
      guest: booking.guest.toString(),
      host: booking.host.toString(),
      checkIn: booking.checkIn,
      checkOut: booking.checkOut,
      daysCount: booking.daysCount,
      pricePerDay: booking.pricePerDay,
      bookingAmount: booking.bookingAmount,
      vat: booking.vat,
      vatAmount: booking.vatAmount,
      totalAmount: booking.totalAmount,
      currency: booking.currency,
      adultsCount: booking.adultsCount,
      kidsCount: booking.kidsCount,
      notes: booking.notes,
      status: booking.status,
      cancellationReason: booking.cancellationReason,
      createdAt: booking.createdAt,
      updatedAt: booking.updatedAt,
    };
  }
}
