import type { BookingEntity } from '@application/bookings/entities/booking.entity';
import { BookingHostDecision } from '@application/bookings/enums/booking-host-decision.enum';
import { BookingStatus } from '@application/bookings/enums/booking-status.enum';
import { BOOKING_REPOSITORY } from '@application/bookings/repositories/booking-repository.token';
import type { BookingRepository } from '@application/bookings/repositories/booking.repository';
import { ApplicationError } from '@common/errors/application.error';
import { Inject, Injectable } from '@nestjs/common';

@Injectable()
export class UpdateBookingStatusByHostUseCase {
  constructor(@Inject(BOOKING_REPOSITORY) private readonly bookingRepository: BookingRepository) {}

  async execute(
    bookingId: string,
    hostId: string,
    status: BookingHostDecision,
  ): Promise<BookingEntity> {
    const booking = await this.bookingRepository.findById(bookingId);
    if (!booking) throw new ApplicationError('BOOKING_NOT_FOUND');

    if (booking.host !== hostId) throw new ApplicationError('BOOKING_ACCESS_DENIED');

    if (booking.status !== BookingStatus.PENDING) {
      throw new ApplicationError('BOOKING_INVALID_STATUS_TRANSITION');
    }

    if (status === BookingHostDecision.CONFIRMED) {
      const conflictingBookings = await this.bookingRepository.find({
        unit: booking.unit,
        status: { $in: [BookingStatus.CONFIRMED] },
        checkIn: { $lt: booking.checkOut },
        checkOut: { $gt: booking.checkIn },
        excludeBookingId: booking.id,
      });

      if (conflictingBookings.length > 0) throw new ApplicationError('BOOKING_NOT_AVAILABLE');
    }

    const updated = await this.bookingRepository.updateById(
      booking.id,
      { host: hostId, status: [BookingStatus.PENDING] },
      {
        status:
          status === BookingHostDecision.CONFIRMED
            ? BookingStatus.CONFIRMED
            : BookingStatus.DECLINED,
      },
    );

    if (!updated) throw new ApplicationError('BOOKING_INVALID_STATUS_TRANSITION');

    return updated;
  }
}
