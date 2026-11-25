export interface BookingReviewEntity {
  id: string;
  booking: string;
  unit: string;
  guest: string;
  guestName?: string;
  rating: number;
  comment?: string;
  createdAt: Date;
}

export interface UnitReviewsPage {
  items: BookingReviewEntity[];
  total: number;
  ratingAverage: number;
  ratingsCount: number;
}
