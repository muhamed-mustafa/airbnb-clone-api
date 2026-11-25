import type {
  BookingReviewEntity,
  UnitReviewsPage,
} from '@application/bookings/entities/booking-review.entity';
import type { CreateBookingReviewInput } from '@application/bookings/inputs/create-booking-review.input';

export interface BookingReviewRepository {
  create(input: CreateBookingReviewInput): Promise<BookingReviewEntity>;
  findForUnit(unitId: string, page: number, limit: number): Promise<UnitReviewsPage | null>;
}
