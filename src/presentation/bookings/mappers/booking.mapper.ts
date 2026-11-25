import type { BookingEntity } from '@application/bookings/entities/booking.entity';
import { BookingStatus } from '@application/bookings/enums/booking-status.enum';
import type { BookingRequestInput } from '@application/bookings/inputs/booking-request.input';
import type { UpdateBookingRequestInput } from '@application/bookings/inputs/update-booking-request.input';
import { BookingRequestDto } from '@presentation/bookings/dtos/booking-request.dto';
import { UpdateBookingRequestDto } from '@presentation/bookings/dtos/update-booking-request.dto';
import { BookingListResponseDto } from '@presentation/bookings/dtos/booking-list-response.dto';
import { BookingResponseDto } from '@presentation/bookings/dtos/booking-response.dto';
import type { BookingReviewEntity } from '@application/bookings/entities/booking-review.entity';
import { BookingReviewResponseDto } from '@presentation/bookings/dtos/booking-review-response.dto';

export class BookingMapper {
  static toReviewResponse(review: BookingReviewEntity): BookingReviewResponseDto {
    return {
      id: review.id,
      guestName: review.guestName,
      rating: review.rating,
      comment: review.comment,
      createdAt: review.createdAt.toISOString(),
    };
  }

  static toRequestInput(request: BookingRequestDto): BookingRequestInput {
    return {
      unit: request.unit,
      checkIn: request.checkIn,
      checkOut: request.checkOut,
      adultsCount: request.adultsCount,
      kidsCount: request.kidsCount,
      notes: request.notes,
    };
  }

  static toUpdateRequestInput(request: UpdateBookingRequestDto): UpdateBookingRequestInput {
    return {
      checkIn: request.checkIn,
      checkOut: request.checkOut,
      adultsCount: request.adultsCount,
      kidsCount: request.kidsCount,
      notes: request.notes,
    };
  }

  static toResponse(booking: BookingEntity): BookingResponseDto {
    return {
      unit: booking.unit,
      guest: booking.guest,
      host: booking.host,
      checkIn: booking.checkIn.toISOString().slice(0, 10),
      checkOut: booking.checkOut.toISOString().slice(0, 10),
      adultsCount: booking.adultsCount,
      kidsCount: booking.kidsCount,
      notes: booking.notes,
      pricePerDay: booking.pricePerDay,
      daysCount: booking.daysCount,
      bookingAmount: booking.bookingAmount,
      vat: booking.vat,
      vatAmount: booking.vatAmount,
      totalAmount: booking.totalAmount,
      status: booking.status,
      cancellationReason: booking.cancellationReason,
    };
  }

  static toListResponse(booking: BookingEntity): BookingListResponseDto {
    return {
      ...this.toResponse(booking),
      id: booking.id,
      unitTitle: booking.unitTitle,
      guestName: booking.guestName,
      hostName: booking.hostName,
      currency: booking.currency,
      createdAt: booking.createdAt.toISOString(),
      updatedAt: booking.updatedAt.toISOString(),
      canReview:
        booking.status === BookingStatus.CONFIRMED &&
        booking.checkOut.getTime() <= Date.now() &&
        !booking.reviewedAt,
    };
  }
}
