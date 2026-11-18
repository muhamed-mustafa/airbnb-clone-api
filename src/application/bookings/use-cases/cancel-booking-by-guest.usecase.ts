import type { BookingEntity } from '@application/bookings/entities/booking.entity';
import { BookingStatus } from '@application/bookings/enums/booking-status.enum';
import type { CancelBookingInput } from '@application/bookings/inputs/cancel-booking.input';
import { BOOKING_REPOSITORY } from '@application/bookings/repositories/booking-repository.token';
import type { BookingRepository } from '@application/bookings/repositories/booking.repository';
import { ApplicationError } from '@common/errors/application.error';
import { Inject, Injectable } from '@nestjs/common';

@Injectable()
export class CancelBookingByGuestUseCase {
  constructor(@Inject(BOOKING_REPOSITORY) private readonly bookingRepository: BookingRepository) {}

  async execute(
    bookingId: string,
    guestId: string,
    input: CancelBookingInput = {},
  ): Promise<BookingEntity> {
    const booking = await this.bookingRepository.findById(bookingId);
    if (!booking) throw new ApplicationError('BOOKING_NOT_FOUND');

    if (booking.guest !== guestId) throw new ApplicationError('BOOKING_ACCESS_DENIED');

    if (![BookingStatus.PENDING, BookingStatus.CONFIRMED].includes(booking.status)) {
      throw new ApplicationError('BOOKING_INVALID_STATUS_TRANSITION');
    }

    const updated = await this.bookingRepository.updateById(
      booking.id,
      { guest: guestId, status: [BookingStatus.PENDING, BookingStatus.CONFIRMED] },
      {
        status: BookingStatus.CANCELLED,
        ...(input.reason !== undefined ? { cancellationReason: input.reason } : {}),
      },
    );

    if (!updated) throw new ApplicationError('BOOKING_INVALID_STATUS_TRANSITION');

    return updated;
  }
}
