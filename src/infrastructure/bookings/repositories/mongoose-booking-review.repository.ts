import type {
  BookingReviewEntity,
  UnitReviewsPage,
} from '@application/bookings/entities/booking-review.entity';
import { BookingStatus } from '@application/bookings/enums/booking-status.enum';
import type { CreateBookingReviewInput } from '@application/bookings/inputs/create-booking-review.input';
import type { BookingReviewRepository } from '@application/bookings/repositories/booking-review.repository';
import { modelNames } from '@common/constants/model-names.constant';
import { ApplicationError } from '@common/errors/application.error';
import type { TransactionRunner } from '@common/transactions/transaction-runner';
import { TRANSACTION_RUNNER } from '@common/transactions/transaction-runner.token';
import type { BookingReview } from '@infrastructure/bookings/schemas/booking-reviews.schema';
import { Booking } from '@infrastructure/bookings/schemas/bookings.schema';
import { toClientSession } from '@infrastructure/database/mongoose-transaction-runner';
import { Unit } from '@infrastructure/units/schemas/units.schema';
import { Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types, type QueryFilter } from 'mongoose';

type ReviewGuest = Types.ObjectId | { _id: Types.ObjectId; name?: string };
type BookingWithReview = {
  _id: Types.ObjectId;
  unit: Types.ObjectId;
  guest: ReviewGuest;
  review: BookingReview;
};

@Injectable()
export class MongooseBookingReviewRepository implements BookingReviewRepository {
  constructor(
    @InjectModel(modelNames.BOOKINGS) private readonly bookingModel: Model<Booking>,
    @InjectModel(modelNames.UNITS) private readonly unitModel: Model<Unit>,
    @Inject(TRANSACTION_RUNNER) private readonly transactionRunner: TransactionRunner,
  ) {}

  async create(input: CreateBookingReviewInput): Promise<BookingReviewEntity> {
    return this.transactionRunner.run(async (session) => {
      const clientSession = toClientSession(session);

      const booking = await this.bookingModel
        .findOneAndUpdate(
          {
            _id: new Types.ObjectId(input.bookingId),
            unit: new Types.ObjectId(input.unitId),
            guest: new Types.ObjectId(input.guestId),
            status: BookingStatus.CONFIRMED,
            checkOut: { $lte: new Date() },
            review: { $exists: false },
          } as QueryFilter<Booking>,
          {
            $set: {
              review: {
                rating: input.rating,
                comment: input.comment,
                createdAt: new Date(),
                updatedAt: new Date(),
              },
            },
          },
          { new: true, session: clientSession },
        )
        .exec();

      if (!booking) {
        const existing = await this.bookingModel
          .findById(input.bookingId)
          .select('review')
          .session(clientSession ?? null)
          .lean()
          .exec();

        if (existing?.review) throw new ApplicationError('BOOKING_ALREADY_REVIEWED');

        throw new ApplicationError('BOOKING_REVIEW_NOT_ELIGIBLE');
      }

      const unit = await this.unitModel
        .findById(input.unitId)
        .session(clientSession ?? null)
        .exec();

      if (!unit) throw new ApplicationError('UNIT_NOT_FOUND');

      const previousCount = unit.ratingsCount ?? 0;
      const nextCount = previousCount + 1;
      unit.ratingAverage = ((unit.ratingAverage ?? 0) * previousCount + input.rating) / nextCount;
      unit.ratingsCount = nextCount;

      await unit.save({ session: clientSession });

      return this.toEntity({
        _id: booking._id,
        unit: booking.unit,
        guest: booking.guest,
        review: booking.review!,
      });
    });
  }

  async findForUnit(unitId: string, page: number, limit: number): Promise<UnitReviewsPage | null> {
    const unit = await this.unitModel
      .findById(unitId)
      .select('ratingAverage ratingsCount')
      .lean()
      .exec();

    if (!unit) return null;

    const query = {
      unit: new Types.ObjectId(unitId),
      review: { $exists: true },
    };

    const [bookings, total] = await Promise.all([
      this.bookingModel
        .find(query)
        .populate<{ guest: { _id: Types.ObjectId; name?: string } }>('guest', 'name')
        .sort({ 'review.createdAt': -1, _id: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean<BookingWithReview[]>()
        .exec(),

      this.bookingModel.countDocuments(query).exec(),
    ]);

    return {
      items: bookings.map((booking) => this.toEntity(booking)),
      total,
      ratingAverage: unit.ratingAverage ?? 0,
      ratingsCount: unit.ratingsCount ?? 0,
    };
  }

  private toEntity(booking: BookingWithReview): BookingReviewEntity {
    const guestId =
      booking.guest instanceof Types.ObjectId
        ? booking.guest.toString()
        : booking.guest._id.toString();
    const guestName = booking.guest instanceof Types.ObjectId ? undefined : booking.guest.name;

    return {
      id: booking.review._id.toString(),
      booking: booking._id.toString(),
      unit: booking.unit.toString(),
      guest: guestId,
      guestName,
      rating: booking.review.rating,
      comment: booking.review.comment,
      createdAt: booking.review.createdAt,
    };
  }
}
