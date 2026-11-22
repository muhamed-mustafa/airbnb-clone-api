import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator';
import { BookingListFiltersDto } from './booking-list-filters.dto';

export class FindAllBookingsDto extends BookingListFiltersDto {
  @ApiPropertyOptional({
    description: 'Search guest, host, or unit by display name.',
    minLength: 2,
    maxLength: 100,
    example: 'Mohamed',
  })
  @IsOptional()
  @Transform(({ value }: { value: unknown }) => (typeof value === 'string' ? value.trim() : value))
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  search?: string;
}
