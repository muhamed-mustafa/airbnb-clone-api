import { BookingEntity } from '@application/bookings/entities/booking.entity';
import { BookingStatus } from '@application/bookings/enums/booking-status.enum';
import { BookingRepository } from '@application/bookings/repositories/booking.repository';
import { BookingCalculationUseCase } from '@application/bookings/use-cases/booking-calculation.usecase';
import { BookingValidationUseCase } from '@application/bookings/use-cases/booking-validation.usecase';
import { UnitService } from '@application/units/services/unit.service';
import { ApplicationError } from '@common/errors/application.error';
import { UpdateBookingRequestByGuestUseCase } from './update-booking-request-by-guest.usecase';

describe('UpdateBookingRequestByGuestUseCase', () => {
  const booking = {
    id: 'booking-id',
    unit: 'unit-id',
    guest: 'guest-id',
    host: 'host-id',
    checkIn: new Date('2027-01-10T00:00:00.000Z'),
    checkOut: new Date('2027-01-12T00:00:00.000Z'),
    adultsCount: 2,
    kidsCount: 0,
    notes: 'Original note',
    status: BookingStatus.PENDING,
  } as BookingEntity;
  const calculation = {
    pricePerDay: 100,
    daysCount: 3,
    bookingAmount: 300,
    vat: 14,
    vatAmount: 42,
    totalAmount: 342,
  };

  function setup(overrides: { booking?: BookingEntity | null; available?: boolean } = {}) {
    const findById = jest
      .fn()
      .mockResolvedValue(overrides.booking === undefined ? booking : overrides.booking);
    const updateById = jest
      .fn()
      .mockImplementation((_id: unknown, _filter: unknown, changes: Partial<BookingEntity>) =>
        Promise.resolve({ ...booking, ...changes }),
      );
    const validate = jest.fn().mockResolvedValue(overrides.available ?? true);
    const calculate = jest.fn().mockResolvedValue(calculation);
    const findUnit = jest.fn().mockResolvedValue({ id: booking.unit, isActive: true });
    const repository = { findById, updateById } as unknown as BookingRepository;
    const validation = { execute: validate } as unknown as BookingValidationUseCase;
    const pricing = { execute: calculate } as unknown as BookingCalculationUseCase;
    const unitService = { findOne: findUnit } as unknown as UnitService;
    const useCase = new UpdateBookingRequestByGuestUseCase(
      repository,
      validation,
      pricing,
      unitService,
    );
    return { useCase, findById, updateById, validate, calculate, findUnit };
  }

  it('updates only the guest-owned pending request, revalidates availability, and recalculates the total', async () => {
    const { useCase, updateById, validate, calculate } = setup();
    const checkIn = new Date('2027-01-10T00:00:00.000Z');
    const checkOut = new Date('2027-01-13T00:00:00.000Z');

    await expect(
      useCase.execute(booking.id, booking.guest, { checkOut, notes: 'Updated note' }),
    ).resolves.toMatchObject({ checkOut, totalAmount: 342, notes: 'Updated note' });

    expect(validate).toHaveBeenCalledWith({
      unit: booking.unit,
      checkIn,
      checkOut,
      adultsCount: booking.adultsCount,
      kidsCount: booking.kidsCount,
      excludeBookingId: booking.id,
    });
    expect(calculate).toHaveBeenCalledWith({ unitId: booking.unit, checkIn, checkOut });
    expect(updateById).toHaveBeenCalledWith(
      booking.id,
      { guest: booking.guest, status: [BookingStatus.PENDING] },
      expect.objectContaining({ checkIn, checkOut, notes: 'Updated note', ...calculation }),
    );
  });

  it('rejects an empty update', async () => {
    const { useCase } = setup();
    await expect(useCase.execute(booking.id, booking.guest, {})).rejects.toThrow(
      new ApplicationError('BOOKING_UPDATE_EMPTY'),
    );
  });

  it('returns not found when the booking does not exist', async () => {
    const { useCase } = setup({ booking: null });
    await expect(useCase.execute(booking.id, booking.guest, { notes: 'Hi' })).rejects.toThrow(
      new ApplicationError('BOOKING_NOT_FOUND'),
    );
  });

  it('rejects a user who is not the guest', async () => {
    const { useCase } = setup();
    await expect(useCase.execute(booking.id, 'other-user', { notes: 'Hi' })).rejects.toThrow(
      new ApplicationError('BOOKING_ACCESS_DENIED'),
    );
  });

  it('rejects requests that are no longer pending', async () => {
    const { useCase } = setup({ booking: { ...booking, status: BookingStatus.CONFIRMED } });
    await expect(useCase.execute(booking.id, booking.guest, { notes: 'Hi' })).rejects.toThrow(
      new ApplicationError('BOOKING_INVALID_STATUS_TRANSITION'),
    );
  });

  it('rejects invalid date ranges', async () => {
    const { useCase, validate } = setup();
    await expect(
      useCase.execute(booking.id, booking.guest, { checkOut: booking.checkIn }),
    ).rejects.toThrow(new ApplicationError('BOOKING_INVALID_DATE_RANGE'));
    expect(validate).not.toHaveBeenCalled();
  });

  it('rejects dates or guest counts that are no longer available', async () => {
    const { useCase, calculate, updateById } = setup({ available: false });
    await expect(useCase.execute(booking.id, booking.guest, { adultsCount: 3 })).rejects.toThrow(
      new ApplicationError('BOOKING_NOT_AVAILABLE'),
    );
    expect(calculate).not.toHaveBeenCalled();
    expect(updateById).not.toHaveBeenCalled();
  });

  it('does not overwrite fields that were omitted from the patch', async () => {
    const { useCase, updateById } = setup();
    await useCase.execute(booking.id, booking.guest, { adultsCount: 3 });
    expect(updateById).toHaveBeenCalledWith(
      booking.id,
      expect.any(Object),
      expect.not.objectContaining({ notes: undefined }),
    );
  });
});
