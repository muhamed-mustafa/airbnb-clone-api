import type { BookingEntity } from '@application/bookings/entities/booking.entity';
import type { BookingRequestInput } from '@application/bookings/inputs/booking-request.input';
import { BookingRequestDto } from '@presentation/bookings/dtos/booking-request.dto';
import { BookingResponseDto } from '@presentation/bookings/dtos/booking-response.dto';

export class BookingMapper {
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
}
