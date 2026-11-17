import type { BookingEntity } from '@application/bookings/entities/booking.entity';
import { BOOKING_REPOSITORY } from '@application/bookings/repositories/booking-repository.token';
import type { BookingRepository } from '@application/bookings/repositories/booking.repository';
import { ApplicationError } from '@common/errors/application.error';
import { Inject, Injectable } from '@nestjs/common';
import { CheckBookingAuthUseCase } from './check-booking-auth.usecase';

@Injectable()
export class FindBookingByIdUseCase {
  constructor(
    @Inject(BOOKING_REPOSITORY) private readonly bookingRepository: BookingRepository,
    private readonly checkBookingAuthUseCase: CheckBookingAuthUseCase,
  ) {}

  async execute(bookingId: string, userId: string): Promise<BookingEntity> {
    const booking = await this.bookingRepository.findById(bookingId);

    if (!booking) throw new ApplicationError('BOOKING_NOT_FOUND');

    this.checkBookingAuthUseCase.execute(booking, userId);

    return booking;
  }
}
