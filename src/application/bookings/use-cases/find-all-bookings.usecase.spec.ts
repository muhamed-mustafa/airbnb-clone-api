import { BookingStatus } from '@application/bookings/enums/booking-status.enum';
import type { BookingRepository } from '@application/bookings/repositories/booking.repository';
import { FindAllBookingsUseCase } from './find-all-bookings.usecase';

describe('FindAllBookingsUseCase', () => {
  it('returns paginated bookings and forwards the admin filters', async () => {
    const findAll = jest.fn().mockResolvedValue({ items: [], total: 21 });
    const bookingRepository = {
      findAll,
    } as unknown as BookingRepository;
    const useCase = new FindAllBookingsUseCase(bookingRepository);
    const filter = {
      page: 2,
      limit: 10,
      status: BookingStatus.PENDING,
      guest: '670d1234567890abcdef1238',
    };

    const result = await useCase.execute(filter);

    expect(findAll).toHaveBeenCalledWith(filter);
    expect(result).toEqual({
      data: [],
      meta: {
        page: 2,
        limit: 10,
        total: 21,
        totalPages: 3,
        hasNextPage: true,
        hasPreviousPage: true,
      },
    });
  });
});
