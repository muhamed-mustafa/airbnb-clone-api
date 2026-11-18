export type BookingValidationInput = {
  unit: string;
  checkIn: Date;
  checkOut: Date;
  adultsCount?: number;
  kidsCount?: number;
  excludeBookingId?: string;
};
