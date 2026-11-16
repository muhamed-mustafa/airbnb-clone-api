import { BookingEntity } from '@application/bookings/entities/booking.entity';
import { OverlappingBookingsFilter } from '@application/bookings/repositories/booking-filter';

export interface BookingAvailabilityRepository {
  find(filter: OverlappingBookingsFilter): Promise<BookingEntity[]>;
}
