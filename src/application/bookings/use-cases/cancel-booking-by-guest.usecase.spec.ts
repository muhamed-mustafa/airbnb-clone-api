import { BookingEntity } from '@application/bookings/entities/booking.entity';
import { BookingStatus } from '@application/bookings/enums/booking-status.enum';
import { BookingRepository } from '@application/bookings/repositories/booking.repository';
import { ApplicationError } from '@common/errors/application.error';
import { CancelBookingByGuestUseCase } from './cancel-booking-by-guest.usecase';

describe('CancelBookingByGuestUseCase', () => {
  const booking = {
    id: 'booking-id',
    guest: 'guest-id',
    status: BookingStatus.PENDING,
  } as BookingEntity;

  function setup(current: BookingEntity | null = booking) {
    const findById = jest.fn().mockResolvedValue(current);
    const updateById = jest
      .fn()
      .mockImplementation((_id: unknown, _filter: unknown, changes: Partial<BookingEntity>) =>
        Promise.resolve({ ...booking, ...changes }),
      );
    const repository = { findById, updateById } as unknown as BookingRepository;
    return { useCase: new CancelBookingByGuestUseCase(repository), findById, updateById };
  }

  it.each([BookingStatus.PENDING, BookingStatus.CONFIRMED])(
    'cancels a guest-owned %s booking and stores the reason',
    async (status) => {
      const { useCase, updateById } = setup({ ...booking, status });
      await expect(
        useCase.execute(booking.id, booking.guest, { reason: 'Plans changed' }),
      ).resolves.toMatchObject({
        status: BookingStatus.CANCELLED,
        cancellationReason: 'Plans changed',
      });
      expect(updateById).toHaveBeenCalledWith(
        booking.id,
        { guest: booking.guest, status: [BookingStatus.PENDING, BookingStatus.CONFIRMED] },
        { status: BookingStatus.CANCELLED, cancellationReason: 'Plans changed' },
      );
    },
  );

  it('allows cancellation without a reason', async () => {
    const { useCase, updateById } = setup();
    await useCase.execute(booking.id, booking.guest);
    expect(updateById).toHaveBeenCalledWith(booking.id, expect.any(Object), {
      status: BookingStatus.CANCELLED,
    });
  });

  it('returns not found when the booking does not exist', async () => {
    const { useCase, updateById } = setup(null);
    await expect(useCase.execute(booking.id, booking.guest)).rejects.toThrow(
      new ApplicationError('BOOKING_NOT_FOUND'),
    );
    expect(updateById).not.toHaveBeenCalled();
  });

  it('rejects cancellation by a host or unrelated user', async () => {
    const { useCase, updateById } = setup();
    await expect(useCase.execute(booking.id, 'other-user')).rejects.toThrow(
      new ApplicationError('BOOKING_ACCESS_DENIED'),
    );
    expect(updateById).not.toHaveBeenCalled();
  });

  it.each([BookingStatus.DECLINED, BookingStatus.CANCELLED])(
    'rejects a booking already in %s state',
    async (status) => {
      const { useCase, updateById } = setup({ ...booking, status });
      await expect(useCase.execute(booking.id, booking.guest)).rejects.toThrow(
        new ApplicationError('BOOKING_INVALID_STATUS_TRANSITION'),
      );
      expect(updateById).not.toHaveBeenCalled();
    },
  );

  it('rejects a concurrent status change through the conditional update', async () => {
    const { useCase, updateById } = setup();
    updateById.mockResolvedValue(null);
    await expect(useCase.execute(booking.id, booking.guest)).rejects.toThrow(
      new ApplicationError('BOOKING_INVALID_STATUS_TRANSITION'),
    );
  });
});
