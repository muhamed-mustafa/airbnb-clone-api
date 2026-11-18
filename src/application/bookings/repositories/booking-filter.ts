import { BookingStatus } from '@application/bookings/enums/booking-status.enum';
import { BookingParty } from '@application/bookings/enums/booking-party.enum';

export type OverlappingBookingsFilter = {
  unit: string;
  status: { $in: BookingStatus[] };
  checkIn: { $lt: Date };
  checkOut: { $gt: Date };
  excludeBookingId?: string;
};

export type BookingListFilter = {
  page?: number;
  limit?: number;
  status?: BookingStatus;
  search?: string;
  checkInFrom?: Date;
  checkInTo?: Date;
  createdFrom?: Date;
  createdTo?: Date;
};

export type MyBookingsFilter = Omit<BookingListFilter, 'search'> & {
  party?: BookingParty;
};
