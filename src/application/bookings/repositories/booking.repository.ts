import type { BookingEntity } from '@application/bookings/entities/booking.entity';
import type { CreateBookingRecordInput } from '@application/bookings/inputs/create-booking-record.input';
import type { BookingAvailabilityRepository } from '@application/bookings/repositories/booking-availability.repository';
import type {
  BookingListFilter,
  MyBookingsFilter,
} from '@application/bookings/repositories/booking-filter';

export interface BookingRepository extends BookingAvailabilityRepository {
  create(input: CreateBookingRecordInput): Promise<BookingEntity>;
  findById(id: string): Promise<BookingEntity | null>;
  updateById(
    id: string,
    filter: { guest?: string; host?: string; status: BookingEntity['status'][] },
    changes: Partial<
      Pick<
        BookingEntity,
        | 'checkIn'
        | 'checkOut'
        | 'daysCount'
        | 'pricePerDay'
        | 'bookingAmount'
        | 'vat'
        | 'vatAmount'
        | 'totalAmount'
        | 'adultsCount'
        | 'kidsCount'
        | 'notes'
        | 'status'
        | 'cancellationReason'
      >
    >,
  ): Promise<BookingEntity | null>;
  findAll(filter: BookingListFilter): Promise<{ items: BookingEntity[]; total: number }>;
  findForUser(
    userId: string,
    filter: MyBookingsFilter,
  ): Promise<{ items: BookingEntity[]; total: number }>;
}
