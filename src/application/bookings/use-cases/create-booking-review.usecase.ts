import type { BookingReviewEntity } from '@application/bookings/entities/booking-review.entity';
import { BookingStatus } from '@application/bookings/enums/booking-status.enum';
import type { CreateBookingReviewInput } from '@application/bookings/inputs/create-booking-review.input';
import { BOOKING_REPOSITORY } from '@application/bookings/repositories/booking-repository.token';
import { BOOKING_REVIEW_REPOSITORY } from '@application/bookings/repositories/booking-review-repository.token';
import type { BookingReviewRepository } from '@application/bookings/repositories/booking-review.repository';
import type { BookingRepository } from '@application/bookings/repositories/booking.repository';
import { ApplicationError } from '@common/errors/application.error';
import { Inject, Injectable } from '@nestjs/common';

@Injectable()
export class CreateBookingReviewUseCase {
  constructor(
    @Inject(BOOKING_REPOSITORY) private readonly bookingRepository: BookingRepository,
    @Inject(BOOKING_REVIEW_REPOSITORY) private readonly reviewRepository: BookingReviewRepository,
  ) {}

  async execute(
    bookingId: string,
    guestId: string,
    input: Pick<CreateBookingReviewInput, 'rating' | 'comment'>,
  ): Promise<BookingReviewEntity> {
    const booking = await this.bookingRepository.findById(bookingId);
    if (!booking) throw new ApplicationError('BOOKING_NOT_FOUND');

    if (booking.guest !== guestId) throw new ApplicationError('BOOKING_ACCESS_DENIED');

    if (booking.reviewedAt) throw new ApplicationError('BOOKING_ALREADY_REVIEWED');

    if (booking.status !== BookingStatus.CONFIRMED || booking.checkOut.getTime() > Date.now()) {
      throw new ApplicationError('BOOKING_REVIEW_NOT_ELIGIBLE');
    }

    return this.reviewRepository.create({
      bookingId,
      guestId,
      unitId: booking.unit,
      rating: input.rating,
      comment: input.comment?.trim() || undefined,
    });
  }
}
