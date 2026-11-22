import type { BookingEntity } from '@application/bookings/entities/booking.entity';
import type { BookingRepository } from '@application/bookings/repositories/booking.repository';
import { ApplicationError } from '@common/errors/application.error';
import { CheckBookingAuthUseCase } from './check-booking-auth.usecase';
import { FindBookingByIdUseCase } from './find-booking-by-id.usecase';

describe('FindBookingByIdUseCase', () => {
  const booking = { id: 'booking-id', guest: 'guest-id', host: 'host-id' } as BookingEntity;

  it('returns the booking when the requester is a participant', async () => {
    const findById = jest.fn().mockResolvedValue(booking);
    const checkParticipant = jest.fn();
    const repository = { findById } as unknown as BookingRepository;
    const auth = { execute: checkParticipant } as unknown as CheckBookingAuthUseCase;
    const useCase = new FindBookingByIdUseCase(repository, auth);

    await expect(useCase.execute(booking.id, booking.host)).resolves.toBe(booking);
    expect(findById).toHaveBeenCalledWith(booking.id);
    expect(checkParticipant).toHaveBeenCalledWith(booking, booking.host);
  });

  it('returns not found and skips participant checks when the booking is missing', async () => {
    const findById = jest.fn().mockResolvedValue(null);
    const checkParticipant = jest.fn();
    const repository = { findById } as unknown as BookingRepository;
    const auth = { execute: checkParticipant } as unknown as CheckBookingAuthUseCase;
    const useCase = new FindBookingByIdUseCase(repository, auth);

    await expect(useCase.execute('missing-id', 'user-id')).rejects.toThrow(
      new ApplicationError('BOOKING_NOT_FOUND'),
    );
    expect(checkParticipant).not.toHaveBeenCalled();
  });

  it('propagates forbidden access from the participant check', async () => {
    const findById = jest.fn().mockResolvedValue(booking);
    const checkParticipant = jest.fn(() => {
      throw new ApplicationError('BOOKING_ACCESS_DENIED');
    });
    const repository = { findById } as unknown as BookingRepository;
    const auth = { execute: checkParticipant } as unknown as CheckBookingAuthUseCase;
    const useCase = new FindBookingByIdUseCase(repository, auth);

    await expect(useCase.execute(booking.id, 'other-user')).rejects.toThrow(
      new ApplicationError('BOOKING_ACCESS_DENIED'),
    );
  });
});
