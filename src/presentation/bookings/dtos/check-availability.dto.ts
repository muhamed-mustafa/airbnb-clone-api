import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDate,
  IsInt,
  IsMongoId,
  IsOptional,
  Min,
  Validate,
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';

@ValidatorConstraint({ name: 'checkOutAfterCheckIn', async: false })
class CheckOutAfterCheckInConstraint implements ValidatorConstraintInterface {
  validate(checkOut: unknown, args: ValidationArguments): boolean {
    const { checkIn } = args.object as { checkIn?: Date };

    return (
      checkIn instanceof Date && checkOut instanceof Date && checkOut.getTime() > checkIn.getTime()
    );
  }
}

export class CheckAvailabilityDto {
  @ApiProperty({
    description: 'Unit MongoDB ObjectId to check for availability.',
    pattern: '^[a-fA-F0-9]{24}$',
    example: '670d1234567890abcdef1237',
  })
  @IsMongoId({ message: i18nValidationMessage('validation.isMongoId') })
  unit!: string;

  @ApiProperty({
    description: 'Requested check-in date in YYYY-MM-DD format.',
    type: String,
    format: 'date',
    example: '2027-01-10',
  })
  @Type(() => Date)
  @IsDate({ message: i18nValidationMessage('validation.isDate') })
  checkIn!: Date;

  @ApiProperty({
    description: 'Requested check-out date in YYYY-MM-DD format; must be after check-in.',
    type: String,
    format: 'date',
    example: '2027-01-15',
  })
  @Type(() => Date)
  @IsDate({ message: i18nValidationMessage('validation.isDate') })
  @Validate(CheckOutAfterCheckInConstraint, {
    message: i18nValidationMessage('validation.checkOutAfterCheckIn'),
  })
  checkOut!: Date;

  @ApiPropertyOptional({
    description: 'Number of adults included in the availability and price calculation.',
    type: 'integer',
    minimum: 1,
    example: 2,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: i18nValidationMessage('validation.isInt') })
  @Min(1, { message: i18nValidationMessage('validation.min') })
  adultsCount?: number;

  @ApiPropertyOptional({
    description: 'Number of children included in the availability and price calculation.',
    type: 'integer',
    minimum: 0,
    example: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: i18nValidationMessage('validation.isInt') })
  @Min(0, { message: i18nValidationMessage('validation.min') })
  kidsCount?: number;
}
