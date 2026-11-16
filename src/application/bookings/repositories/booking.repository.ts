import type { BookingEntity } from '@application/bookings/entities/booking.entity';
import type { CreateBookingRecordInput } from '@application/bookings/inputs/create-booking-record.input';
import type { BookingAvailabilityRepository } from '@application/bookings/repositories/booking-availability.repository';

export interface BookingRepository extends BookingAvailabilityRepository {
  create(input: CreateBookingRecordInput): Promise<BookingEntity>;
}
