import { BookingHostDecision } from '@application/bookings/enums/booking-host-decision.enum';
import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';

export class UpdateBookingStatusDto {
  @ApiProperty({
    enum: BookingHostDecision,
    description: 'Hosts can confirm or decline a pending booking request.',
    example: BookingHostDecision.CONFIRMED,
  })
  @IsEnum(BookingHostDecision, { message: i18nValidationMessage('validation.isEnum') })
  status!: BookingHostDecision;
}
