import type { BookingEntity } from '@application/bookings/entities/booking.entity';
import { BOOKING_REPOSITORY } from '@application/bookings/repositories/booking-repository.token';
import type { MyBookingsFilter } from '@application/bookings/repositories/booking-filter';
import type { BookingRepository } from '@application/bookings/repositories/booking.repository';
import { PaginatedResult } from '@common/pagination/pagination.types';
import { createPaginationMeta } from '@common/pagination/pagination.utils';
import { Inject, Injectable } from '@nestjs/common';

@Injectable()
export class FindMyBookingsUseCase {
  constructor(@Inject(BOOKING_REPOSITORY) private readonly bookingRepository: BookingRepository) {}

  async execute(
    userId: string,
    filter: MyBookingsFilter = {},
  ): Promise<PaginatedResult<BookingEntity>> {
    const { page = 1, limit = 10 } = filter;
    const { items, total } = await this.bookingRepository.findForUser(userId, filter);

    return {
      data: items,
      meta: createPaginationMeta(page, limit, total),
    };
  }
}
