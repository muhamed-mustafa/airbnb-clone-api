import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, MaxLength, ValidateIf } from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';

export class CancelBookingDto {
  @ApiPropertyOptional({
    description: 'Optional cancellation reason.',
    maxLength: 500,
    example: 'My travel dates changed.',
  })
  @ValidateIf((_object, value) => value !== undefined)
  @IsString({ message: i18nValidationMessage('validation.isString') })
  @MaxLength(500, { message: i18nValidationMessage('validation.maxLength') })
  reason?: string;
}
