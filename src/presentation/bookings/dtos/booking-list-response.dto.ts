import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { BookingResponseDto } from './booking-response.dto';

export class BookingListResponseDto extends BookingResponseDto {
  @ApiProperty({ description: 'Booking MongoDB ObjectId.', example: '670d1234567890abcdef123a' })
  id!: string;

  @ApiPropertyOptional({
    description: 'Accommodation title shown to administrators.',
    example: 'Sea view apartment',
  })
  unitTitle?: string;

  @ApiPropertyOptional({ description: 'Guest display name.', example: 'Mohamed Mustafa' })
  guestName?: string;

  @ApiPropertyOptional({ description: 'Host display name.', example: 'Nour Hassan' })
  hostName?: string;

  @ApiProperty({ description: 'Currency code for the booking.', example: 'EGP' })
  currency!: string;

  @ApiProperty({
    description: 'Whether the current guest can review this completed booking.',
    example: false,
  })
  canReview!: boolean;

  @ApiProperty({ type: String, format: 'date-time' })
  createdAt!: string;

  @ApiProperty({ type: String, format: 'date-time' })
  updatedAt!: string;
}
