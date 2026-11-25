import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class BookingReviewResponseDto {
  @ApiProperty({ example: '670d1234567890abcdef123a' })
  id!: string;

  @ApiPropertyOptional({ example: 'Mohamed Mustafa' })
  guestName?: string;

  @ApiProperty({ minimum: 1, maximum: 5, example: 5 })
  rating!: number;

  @ApiPropertyOptional({ maxLength: 1000, example: 'Clean and comfortable.' })
  comment?: string;

  @ApiProperty({ type: String, format: 'date-time' })
  createdAt!: string;
}
