import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsDate, IsInt, IsString, MaxLength, Min, ValidateIf } from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';

export class UpdateBookingRequestDto {
  @ApiPropertyOptional({
    description: 'Updated check-in calendar date. Must be before check-out.',
    type: String,
    format: 'date',
    example: '2027-01-12',
  })
  @ValidateIf((_object, value) => value !== undefined)
  @Type(() => Date)
  @IsDate({ message: i18nValidationMessage('validation.isDate') })
  checkIn?: Date;

  @ApiPropertyOptional({
    description: 'Updated check-out calendar date. Must be after check-in.',
    type: String,
    format: 'date',
    example: '2027-01-17',
  })
  @ValidateIf((_object, value) => value !== undefined)
  @Type(() => Date)
  @IsDate({ message: i18nValidationMessage('validation.isDate') })
  checkOut?: Date;

  @ApiPropertyOptional({ type: 'integer', minimum: 1, example: 2 })
  @ValidateIf((_object, value) => value !== undefined)
  @Type(() => Number)
  @IsInt({ message: i18nValidationMessage('validation.isInt') })
  @Min(1, { message: i18nValidationMessage('validation.min') })
  adultsCount?: number;

  @ApiPropertyOptional({ type: 'integer', minimum: 0, example: 1 })
  @ValidateIf((_object, value) => value !== undefined)
  @Type(() => Number)
  @IsInt({ message: i18nValidationMessage('validation.isInt') })
  @Min(0, { message: i18nValidationMessage('validation.min') })
  kidsCount?: number;

  @ApiPropertyOptional({
    description: 'Replacement note for the host. Send an empty string to clear it.',
    maxLength: 1000,
  })
  @ValidateIf((_object, value) => value !== undefined)
  @IsString({ message: i18nValidationMessage('validation.isString') })
  @MaxLength(1000, { message: i18nValidationMessage('validation.maxLength') })
  notes?: string;
}
