export type UpdateBookingRequestInput = {
  checkIn?: Date;
  checkOut?: Date;
  adultsCount?: number;
  kidsCount?: number;
  notes?: string;
};
