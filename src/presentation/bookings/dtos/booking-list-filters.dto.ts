import { BookingStatus } from '@application/bookings/enums/booking-status.enum';
import { PaginationDto } from '@common/pagination/pagination.dto';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsDate,
  IsEnum,
  IsOptional,
  Validate,
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';

@ValidatorConstraint({ name: 'bookingDateRange', async: false })
class BookingDateRangeConstraint implements ValidatorConstraintInterface {
  validate(to: unknown, args: ValidationArguments): boolean {
    const range = args.object as { checkInFrom?: unknown; createdFrom?: unknown };
    const from = args.property === 'checkInTo' ? range.checkInFrom : range.createdFrom;

    return (
      !(from instanceof Date) ||
      !(to instanceof Date) ||
      (Number.isFinite(from.getTime()) && Number.isFinite(to.getTime()) && to >= from)
    );
  }
}

export class BookingListFiltersDto extends PaginationDto {
  @ApiPropertyOptional({ enum: BookingStatus, example: BookingStatus.PENDING })
  @IsOptional()
  @IsEnum(BookingStatus, { message: i18nValidationMessage('validation.isEnum') })
  status?: BookingStatus;

  @ApiPropertyOptional({
    description: 'Include bookings whose check-in is on or after this date.',
    type: String,
    format: 'date',
    example: '2027-01-01',
  })
  @IsOptional()
  @Type(() => Date)
  @IsDate({ message: i18nValidationMessage('validation.isDate') })
  checkInFrom?: Date;

  @ApiPropertyOptional({
    description: 'Include bookings whose check-in is on or before this date.',
    type: String,
    format: 'date',
    example: '2027-12-31',
  })
  @IsOptional()
  @Type(() => Date)
  @IsDate({ message: i18nValidationMessage('validation.isDate') })
  @Validate(BookingDateRangeConstraint, ['checkInFrom'], {
    message: i18nValidationMessage('validation.isValidBookingDateRange'),
  })
  checkInTo?: Date;

  @ApiPropertyOptional({
    description: 'Include bookings created on or after this date.',
    type: String,
    format: 'date',
    example: '2027-01-01',
  })
  @IsOptional()
  @Type(() => Date)
  @IsDate({ message: i18nValidationMessage('validation.isDate') })
  createdFrom?: Date;

  @ApiPropertyOptional({
    description: 'Include bookings created on or before this date.',
    type: String,
    format: 'date',
    example: '2027-12-31',
  })
  @IsOptional()
  @Type(() => Date)
  @IsDate({ message: i18nValidationMessage('validation.isDate') })
  @Validate(BookingDateRangeConstraint, ['createdFrom'], {
    message: i18nValidationMessage('validation.isValidBookingDateRange'),
  })
  createdTo?: Date;
}
