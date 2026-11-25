import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString, Max, MaxLength, Min } from 'class-validator';

export class CreateBookingReviewDto {
  @ApiProperty({
    description: 'Guest rating from 1 to 5 stars.',
    minimum: 1,
    maximum: 5,
    example: 5,
  })
  @IsInt()
  @Min(1)
  @Max(5)
  rating!: number;

  @ApiPropertyOptional({
    description: 'Optional review text.',
    maxLength: 1000,
    example: 'Clean and comfortable.',
  })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  comment?: string;
}
