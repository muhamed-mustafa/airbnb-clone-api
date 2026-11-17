import type { BookingEntity } from '@application/bookings/entities/booking.entity';
import { ApplicationError } from '@common/errors/application.error';
import type { Logger } from '@common/logging/logger';
import { LOGGER } from '@common/logging/logger.token';
import { Inject, Injectable } from '@nestjs/common';

@Injectable()
export class CheckBookingAuthUseCase {
  constructor(@Inject(LOGGER) private readonly logger: Logger) {}

  execute(booking: BookingEntity, userId: string): void {
    const isParticipant = booking.guest === userId || booking.host === userId;
    if (isParticipant) return;

    this.logger.warn('Booking access denied', { bookingId: booking.id, userId });
    throw new ApplicationError('BOOKING_ACCESS_DENIED');
  }
}
