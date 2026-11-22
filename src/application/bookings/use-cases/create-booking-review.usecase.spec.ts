import { BookingStatus } from '@application/bookings/enums/booking-status.enum';
import { CreateBookingReviewUseCase } from './create-booking-review.usecase';

describe('CreateBookingReviewUseCase', () => {
  const booking = {
    id: 'booking-id',
    unit: 'unit-id',
    guest: 'guest-id',
    status: BookingStatus.CONFIRMED,
    checkOut: new Date('2020-01-02T00:00:00.000Z'),
  };
  const findById = jest.fn();
  const create = jest.fn();
  const useCase = new CreateBookingReviewUseCase({ findById } as never, { create } as never);

  beforeEach(() => {
    jest.clearAllMocks();
    findById.mockResolvedValue(booking);
    create.mockResolvedValue({ id: 'review-id', rating: 5 });
  });

  it('creates a review for the booking guest after confirmed checkout, deriving unit and guest from booking', async () => {
    await expect(
      useCase.execute('booking-id', 'guest-id', { rating: 5, comment: '  Great stay  ' }),
    ).resolves.toMatchObject({ id: 'review-id' });
    expect(create).toHaveBeenCalledWith({
      bookingId: 'booking-id',
      guestId: 'guest-id',
      unitId: 'unit-id',
      rating: 5,
      comment: 'Great stay',
    });
  });

  it('rejects a non-guest and does not persist a review', async () => {
    await expect(useCase.execute('booking-id', 'other-user', { rating: 5 })).rejects.toMatchObject({
      code: 'BOOKING_ACCESS_DENIED',
    });
    expect(create).not.toHaveBeenCalled();
  });

  it('rejects unconfirmed, future, and already-reviewed bookings', async () => {
    findById.mockResolvedValueOnce({ ...booking, status: BookingStatus.PENDING });
    await expect(useCase.execute('booking-id', 'guest-id', { rating: 5 })).rejects.toMatchObject({
      code: 'BOOKING_REVIEW_NOT_ELIGIBLE',
    });
    findById.mockResolvedValueOnce({ ...booking, checkOut: new Date(Date.now() + 86400000) });
    await expect(useCase.execute('booking-id', 'guest-id', { rating: 5 })).rejects.toMatchObject({
      code: 'BOOKING_REVIEW_NOT_ELIGIBLE',
    });
    findById.mockResolvedValueOnce({ ...booking, reviewedAt: new Date() });
    await expect(useCase.execute('booking-id', 'guest-id', { rating: 5 })).rejects.toMatchObject({
      code: 'BOOKING_ALREADY_REVIEWED',
    });
    expect(create).not.toHaveBeenCalled();
  });
});
