import { BookingEntity } from '@application/bookings/entities/booking.entity';
import { BookingHostDecision } from '@application/bookings/enums/booking-host-decision.enum';
import { BookingStatus } from '@application/bookings/enums/booking-status.enum';
import { BookingRepository } from '@application/bookings/repositories/booking.repository';
import { ApplicationError } from '@common/errors/application.error';
import { UpdateBookingStatusByHostUseCase } from './update-booking-status-by-host.usecase';

describe('UpdateBookingStatusByHostUseCase', () => {
  const booking = {
    id: 'booking-id',
    unit: 'unit-id',
    guest: 'guest-id',
    host: 'host-id',
    checkIn: new Date('2027-01-10T00:00:00.000Z'),
    checkOut: new Date('2027-01-12T00:00:00.000Z'),
    status: BookingStatus.PENDING,
  } as BookingEntity;

  function setup(current: BookingEntity | null = booking) {
    const findById = jest.fn().mockResolvedValue(current);
    const find = jest.fn().mockResolvedValue([]);
    const updateById = jest
      .fn()
      .mockImplementation((_id: unknown, _filter: unknown, changes: Partial<BookingEntity>) =>
        Promise.resolve({ ...booking, ...changes }),
      );
    const repository = { findById, find, updateById } as unknown as BookingRepository;
    return {
      useCase: new UpdateBookingStatusByHostUseCase(repository),
      findById,
      find,
      updateById,
    };
  }

  it('confirms a pending request when there is no confirmed date conflict', async () => {
    const { useCase, find, updateById } = setup();
    await expect(
      useCase.execute(booking.id, booking.host, BookingHostDecision.CONFIRMED),
    ).resolves.toMatchObject({ status: BookingStatus.CONFIRMED });
    expect(find).toHaveBeenCalledWith({
      unit: booking.unit,
      status: { $in: [BookingStatus.CONFIRMED] },
      checkIn: { $lt: booking.checkOut },
      checkOut: { $gt: booking.checkIn },
      excludeBookingId: booking.id,
    });
    expect(updateById).toHaveBeenCalledWith(
      booking.id,
      { host: booking.host, status: [BookingStatus.PENDING] },
      { status: BookingStatus.CONFIRMED },
    );
  });

  it('declines a pending request without running confirmation conflict checks', async () => {
    const { useCase, find, updateById } = setup();
    await expect(
      useCase.execute(booking.id, booking.host, BookingHostDecision.DECLINED),
    ).resolves.toMatchObject({ status: BookingStatus.DECLINED });
    expect(find).not.toHaveBeenCalled();
    expect(updateById).toHaveBeenCalledWith(
      booking.id,
      { host: booking.host, status: [BookingStatus.PENDING] },
      { status: BookingStatus.DECLINED },
    );
  });

  it('rejects confirmation when another confirmed booking overlaps', async () => {
    const { useCase, find, updateById } = setup();
    find.mockResolvedValue([{ id: 'conflict' }]);
    await expect(
      useCase.execute(booking.id, booking.host, BookingHostDecision.CONFIRMED),
    ).rejects.toThrow(new ApplicationError('BOOKING_NOT_AVAILABLE'));
    expect(updateById).not.toHaveBeenCalled();
  });

  it('returns not found when the booking does not exist', async () => {
    const { useCase, updateById } = setup(null);
    await expect(
      useCase.execute(booking.id, booking.host, BookingHostDecision.DECLINED),
    ).rejects.toThrow(new ApplicationError('BOOKING_NOT_FOUND'));
    expect(updateById).not.toHaveBeenCalled();
  });

  it('rejects a guest or unrelated user attempting to decide the request', async () => {
    const { useCase, updateById } = setup();
    await expect(
      useCase.execute(booking.id, booking.guest, BookingHostDecision.DECLINED),
    ).rejects.toThrow(new ApplicationError('BOOKING_ACCESS_DENIED'));
    expect(updateById).not.toHaveBeenCalled();
  });

  it('rejects decisions after the request is no longer pending', async () => {
    const { useCase, updateById } = setup({ ...booking, status: BookingStatus.CANCELLED });
    await expect(
      useCase.execute(booking.id, booking.host, BookingHostDecision.CONFIRMED),
    ).rejects.toThrow(new ApplicationError('BOOKING_INVALID_STATUS_TRANSITION'));
    expect(updateById).not.toHaveBeenCalled();
  });

  it('rejects a concurrent status transition through the conditional update', async () => {
    const { useCase, updateById } = setup();
    updateById.mockResolvedValue(null);
    await expect(
      useCase.execute(booking.id, booking.host, BookingHostDecision.DECLINED),
    ).rejects.toThrow(new ApplicationError('BOOKING_INVALID_STATUS_TRANSITION'));
  });
});
