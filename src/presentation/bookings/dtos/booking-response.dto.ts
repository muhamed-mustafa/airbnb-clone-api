import { BookingStatus } from '@application/bookings/enums/booking-status.enum';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class BookingResponseDto {
  @ApiProperty({ description: 'Unit MongoDB ObjectId.', example: '670d1234567890abcdef1237' })
  unit!: string;

  @ApiProperty({ description: 'Guest MongoDB ObjectId.', example: '670d1234567890abcdef1238' })
  guest!: string;

  @ApiProperty({ description: 'Host MongoDB ObjectId.', example: '670d1234567890abcdef1239' })
  host!: string;

  @ApiProperty({
    description: 'Check-in calendar date in YYYY-MM-DD format.',
    type: String,
    format: 'date',
    example: '2027-01-10',
  })
  checkIn!: string;

  @ApiProperty({
    description: 'Check-out calendar date in YYYY-MM-DD format.',
    type: String,
    format: 'date',
    example: '2027-01-15',
  })
  checkOut!: string;

  @ApiProperty({ description: 'Number of adults.', type: 'integer', minimum: 1, example: 2 })
  adultsCount!: number;

  @ApiPropertyOptional({
    description: 'Number of children.',
    type: 'integer',
    minimum: 0,
    example: 1,
  })
  kidsCount?: number;

  @ApiPropertyOptional({ description: 'Optional note for the host.', maxLength: 1000 })
  notes?: string;

  @ApiProperty({ description: 'Price per night.', minimum: 0, example: 1500 })
  pricePerDay!: number;

  @ApiProperty({ description: 'Number of nights.', type: 'integer', minimum: 1, example: 5 })
  daysCount!: number;

  @ApiProperty({ description: 'Subtotal before VAT.', minimum: 0, example: 7500 })
  bookingAmount!: number;

  @ApiProperty({ description: 'VAT rate used for this booking.', minimum: 0, example: 14 })
  vat!: number;

  @ApiProperty({ description: 'VAT amount.', minimum: 0, example: 1050 })
  vatAmount!: number;

  @ApiProperty({ description: 'Total amount including VAT.', minimum: 0, example: 8550 })
  totalAmount!: number;

  @ApiProperty({ enum: BookingStatus, example: BookingStatus.PENDING })
  status!: BookingStatus;

  @ApiPropertyOptional({ description: 'Reason provided if the booking is cancelled.' })
  cancellationReason?: string;
}
