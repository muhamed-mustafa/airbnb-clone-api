export interface CreateBookingReviewInput {
  bookingId: string;
  unitId: string;
  guestId: string;
  rating: number;
  comment?: string;
}
