import { BookingStatus } from '@application/bookings/enums/booking-status.enum';

export interface BookingEntity {
  id: string;
  unit: string;
  guest: string;
  host: string;
  checkIn: Date;
  checkOut: Date;
  daysCount: number;
  pricePerDay: number;
  bookingAmount: number;
  vat: number;
  vatAmount: number;
  totalAmount: number;
  currency: string;
  adultsCount: number;
  kidsCount: number;
  notes?: string;
  status: BookingStatus;
  cancellationReason?: string;
  createdAt: Date;
  updatedAt: Date;
}
