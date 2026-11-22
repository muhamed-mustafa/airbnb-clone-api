import { BookingListFiltersDto } from './booking-list-filters.dto';
import { BookingParty } from '@application/bookings/enums/booking-party.enum';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';

export class FindMyBookingsDto extends BookingListFiltersDto {
  @ApiPropertyOptional({
    enum: BookingParty,
    description: 'Limit results to bookings where you are the guest or the host. Defaults to both.',
    example: BookingParty.GUEST,
  })
  @IsOptional()
  @IsEnum(BookingParty)
  party?: BookingParty;
}
