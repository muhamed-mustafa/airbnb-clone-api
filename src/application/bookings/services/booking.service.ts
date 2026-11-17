import type { CheckAvailabilityInput } from '@application/bookings/inputs/check-availability.input';
import type { CheckAvailabilityOutput } from '@application/bookings/outputs/check-availability.output';
import type { BookingEntity } from '@application/bookings/entities/booking.entity';
import type { BookingRequestInput } from '@application/bookings/inputs/booking-request.input';
import type {
  BookingListFilter,
  MyBookingsFilter,
} from '@application/bookings/repositories/booking-filter';
import { BookingRequestUseCase } from '@application/bookings/use-cases/booking-request.usecase';
import { CheckAvailabilityUseCase } from '@application/bookings/use-cases/check-availability.usecase';
import { FindAllBookingsUseCase } from '@application/bookings/use-cases/find-all-bookings.usecase';
import { FindMyBookingsUseCase } from '@application/bookings/use-cases/find-my-bookings.usecase';
import { FindBookingByIdUseCase } from '@application/bookings/use-cases/find-booking-by-id.usecase';
import { PaginatedResult } from '@common/pagination/pagination.types';
import { Injectable } from '@nestjs/common';

@Injectable()
export class BookingService {
  constructor(
    private readonly checkAvailabilityUseCase: CheckAvailabilityUseCase,
    private readonly bookingRequestUseCase: BookingRequestUseCase,
    private readonly findAllBookingsUseCase: FindAllBookingsUseCase,
    private readonly findMyBookingsUseCase: FindMyBookingsUseCase,
    private readonly findBookingByIdUseCase: FindBookingByIdUseCase,
  ) {}

  async checkAvailability(input: CheckAvailabilityInput): Promise<CheckAvailabilityOutput> {
    return this.checkAvailabilityUseCase.execute(input);
  }

  async requestBooking(input: BookingRequestInput, guestId: string): Promise<BookingEntity> {
    return this.bookingRequestUseCase.execute(input, guestId);
  }

  async findAll(filter: BookingListFilter = {}): Promise<PaginatedResult<BookingEntity>> {
    return this.findAllBookingsUseCase.execute(filter);
  }

  async findMyBookings(
    userId: string,
    filter: MyBookingsFilter = {},
  ): Promise<PaginatedResult<BookingEntity>> {
    return this.findMyBookingsUseCase.execute(userId, filter);
  }

  async findById(bookingId: string, userId: string): Promise<BookingEntity> {
    return this.findBookingByIdUseCase.execute(bookingId, userId);
  }
}
