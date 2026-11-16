import type { CheckAvailabilityInput } from '@application/bookings/inputs/check-availability.input';
import type { CheckAvailabilityOutput } from '@application/bookings/outputs/check-availability.output';
import type { BookingEntity } from '@application/bookings/entities/booking.entity';
import type { BookingRequestInput } from '@application/bookings/inputs/booking-request.input';
import { BookingRequestUseCase } from '@application/bookings/use-cases/booking-request.usecase';
import { CheckAvailabilityUseCase } from '@application/bookings/use-cases/check-availability.usecase';
import { Injectable } from '@nestjs/common';

@Injectable()
export class BookingService {
  constructor(
    private readonly checkAvailabilityUseCase: CheckAvailabilityUseCase,
    private readonly bookingRequestUseCase: BookingRequestUseCase,
  ) {}

  async checkAvailability(input: CheckAvailabilityInput): Promise<CheckAvailabilityOutput> {
    return this.checkAvailabilityUseCase.execute(input);
  }

  async requestBooking(input: BookingRequestInput, guestId: string): Promise<BookingEntity> {
    return this.bookingRequestUseCase.execute(input, guestId);
  }
}
