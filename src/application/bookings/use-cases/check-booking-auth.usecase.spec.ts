import type { BookingEntity } from '@application/bookings/entities/booking.entity';
import { ApplicationError } from '@common/errors/application.error';
import type { Logger } from '@common/logging/logger';
import { CheckBookingAuthUseCase } from './check-booking-auth.usecase';

describe('CheckBookingAuthUseCase', () => {
  const booking = {
    id: 'booking-id',
    guest: 'guest-id',
    host: 'host-id',
  } as BookingEntity;

  it.each(['guest-id', 'host-id'])('allows a booking participant (%s)', (userId) => {
    const warn = jest.fn();
    const logger = { warn } as unknown as Logger;
    const useCase = new CheckBookingAuthUseCase(logger);

    expect(() => useCase.execute(booking, userId)).not.toThrow();
    expect(warn).not.toHaveBeenCalled();
  });

  it('denies users who are neither guest nor host', () => {
    const warn = jest.fn();
    const logger = { warn } as unknown as Logger;
    const useCase = new CheckBookingAuthUseCase(logger);

    expect(() => useCase.execute(booking, 'other-user')).toThrow(
      new ApplicationError('BOOKING_ACCESS_DENIED'),
    );
    expect(warn).toHaveBeenCalledWith('Booking access denied', {
      bookingId: booking.id,
      userId: 'other-user',
    });
  });
});
