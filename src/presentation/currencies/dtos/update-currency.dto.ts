import { ApiPropertyOptional } from '@nestjs/swagger';
import { isOptionalString } from '@presentation/validators/is-required-string.decorator';
import { Transform } from 'class-transformer';
import { trimString, trimUppercaseString } from '../../utils/transformers.util';
import { AtLeastOneField } from '../../validators/at-least-one-field.decorator';

export class UpdateCurrencyDto {
  @AtLeastOneField(['name', 'currencyCode'])
  private readonly _atLeastOneField!: undefined;

  @ApiPropertyOptional({
    description: 'Currency name.',
    example: 'US Dollar',
    minLength: 3,
    maxLength: 50,
  })
  @Transform(trimString)
  @isOptionalString({ min: 3, max: 50 })
  name!: string;

  @ApiPropertyOptional({
    description: 'Currency code (ISO 4217 alpha-3).',
    example: 'USD',
    minLength: 3,
    maxLength: 3,
  })
  @Transform(trimUppercaseString)
  @isOptionalString({ min: 3, max: 3 })
  currencyCode!: string;
}
