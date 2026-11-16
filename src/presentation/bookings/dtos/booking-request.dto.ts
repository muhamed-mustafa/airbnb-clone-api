import { ApiPropertyOptional } from '@nestjs/swagger';
import { CheckAvailabilityDto } from '@presentation/bookings/dtos/check-availability.dto';
import { IsOptional, IsString, MaxLength } from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';

export class BookingRequestDto extends CheckAvailabilityDto {
  @ApiPropertyOptional({
    description: 'Optional note for the host.',
    maxLength: 1000,
    example: 'We will arrive around 6 PM.',
  })
  @IsOptional()
  @IsString({ message: i18nValidationMessage('validation.isString') })
  @MaxLength(1000, { message: i18nValidationMessage('validation.maxLength') })
  notes?: string;
}
