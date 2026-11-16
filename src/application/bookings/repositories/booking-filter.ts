import { BookingStatus } from '@application/bookings/enums/booking-status.enum';

export type OverlappingBookingsFilter = {
  unit: string;
  status: { $in: BookingStatus[] };
  checkIn: { $lt: Date };
  checkOut: { $gt: Date };
};
