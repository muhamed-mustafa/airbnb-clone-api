import type { BookingEntity } from '@application/bookings/entities/booking.entity';

export type CreateBookingRecordInput = Omit<
  BookingEntity,
  'id' | 'currency' | 'createdAt' | 'updatedAt'
>;
