import { PaginationDto } from '@common/pagination/pagination.dto';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { trimString } from '@presentation/utils/transformers.util';
import { IsValidPriceRange } from '@presentation/utils/validators/is-valid-price-range.validator';
import { Transform, Type } from 'class-transformer';
import {
  IsBoolean,
  IsInt,
  IsMongoId,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';

export class FindAllUnitsDto extends PaginationDto {
  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(50)
  @ApiPropertyOptional({
    description: 'Literal case-insensitive partial match in title or description; trimmed.',
    minLength: 3,
    maxLength: 50,
    example: 'apartment',
  })
  @Transform(trimString)
  title?: string;

  @IsOptional()
  @IsMongoId({ message: i18nValidationMessage('validation.isMongoId') })
  @ApiPropertyOptional({
    description: 'Exact accommodation type ObjectId.',
    pattern: '^[a-fA-F0-9]{24}$',
    example: '670d1234567890abcdef1236',
  })
  unitCategory?: string;

  @IsOptional()
  @IsMongoId({ message: i18nValidationMessage('validation.isMongoId') })
  @ApiPropertyOptional({
    description: 'Exact country ObjectId.',
    pattern: '^[a-fA-F0-9]{24}$',
    example: '670d1234567890abcdef1234',
  })
  country?: string;

  @IsOptional()
  @IsMongoId({ message: i18nValidationMessage('validation.isMongoId') })
  @ApiPropertyOptional({
    description: 'Exact city ObjectId.',
    pattern: '^[a-fA-F0-9]{24}$',
    example: '670d1234567890abcdef1235',
  })
  city?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: i18nValidationMessage('validation.isNumber') })
  @ApiPropertyOptional({ description: 'Inclusive minimum daily cost.', minimum: 1, example: 100 })
  @Min(1, { message: i18nValidationMessage('validation.min') })
  minPrice?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: i18nValidationMessage('validation.isNumber') })
  @ApiPropertyOptional({
    description:
      'Inclusive maximum daily cost. When both bounds are provided, maxPrice must be greater than or equal to minPrice; an invalid range is rejected with HTTP 400.',
    minimum: 1,
    example: 2000,
  })
  @Min(1, { message: i18nValidationMessage('validation.min') })
  @IsValidPriceRange({ message: i18nValidationMessage('validation.isValidPriceRange') })
  maxPrice?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: i18nValidationMessage('validation.isInt') })
  @Min(1, { message: i18nValidationMessage('validation.min') })
  @ApiPropertyOptional({
    description: 'Exact number of rooms.',
    type: 'integer',
    minimum: 1,
    example: 2,
  })
  roomsCount?: number;

  @IsOptional()
  @Transform(({ value }: { value: unknown }) =>
    value === 'true' ? true : value === 'false' ? false : value,
  )
  @IsBoolean({ message: i18nValidationMessage('validation.isBoolean') })
  @ApiPropertyOptional({
    description: 'Exact accommodation availability; true or false.',
    type: Boolean,
    example: true,
  })
  availability?: boolean;

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: i18nValidationMessage('validation.isInt') })
  @ApiPropertyOptional({
    description: 'Exact adult capacity (not a minimum).',
    type: 'integer',
    minimum: 1,
    example: 2,
  })
  @Min(1, { message: i18nValidationMessage('validation.min') })
  adultsCount?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: i18nValidationMessage('validation.isInt') })
  @ApiPropertyOptional({
    description: 'Exact child capacity (not a minimum).',
    type: 'integer',
    minimum: 0,
    example: 0,
  })
  @Min(0, { message: i18nValidationMessage('validation.min') })
  kidsCount?: number;

  @IsOptional()
  @Transform(({ value }: { value: unknown }) =>
    value === 'true' ? true : value === 'false' ? false : value,
  )
  @ApiPropertyOptional({
    description: 'Exact internet availability; true or false.',
    type: Boolean,
    example: false,
  })
  @IsBoolean({ message: i18nValidationMessage('validation.isBoolean') })
  hasInternetService?: boolean;

  @IsOptional()
  @Transform(({ value }: { value: unknown }) =>
    value === 'true' ? true : value === 'false' ? false : value,
  )
  @ApiPropertyOptional({
    description: 'Exact kitchen availability; true or false.',
    type: Boolean,
    example: true,
  })
  @IsBoolean({ message: i18nValidationMessage('validation.isBoolean') })
  hasKitchen?: boolean;

  @IsOptional()
  @Transform(({ value }: { value: unknown }) =>
    value === 'true' ? true : value === 'false' ? false : value,
  )
  @ApiPropertyOptional({
    description: 'Exact private garage availability; true or false.',
    type: Boolean,
    example: false,
  })
  @IsBoolean({ message: i18nValidationMessage('validation.isBoolean') })
  hasPrivateGarage?: boolean;
}
