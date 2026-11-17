import { BookingParty } from '@application/bookings/enums/booking-party.enum';
import type { BookingRepository } from '@application/bookings/repositories/booking.repository';
import { FindMyBookingsUseCase } from './find-my-bookings.usecase';

describe('FindMyBookingsUseCase', () => {
  it('scopes the listing to the authenticated user and applies the requested party filter', async () => {
    const findForUser = jest.fn().mockResolvedValue({ items: [], total: 0 });
    const bookingRepository = {
      findForUser,
    } as unknown as BookingRepository;
    const useCase = new FindMyBookingsUseCase(bookingRepository);

    await useCase.execute('authenticated-user', {
      page: 2,
      limit: 5,
      party: BookingParty.HOST,
    });

    expect(findForUser).toHaveBeenCalledWith('authenticated-user', {
      page: 2,
      limit: 5,
      party: BookingParty.HOST,
    });
  });
});
