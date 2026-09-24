import { ApiProperty } from '@nestjs/swagger';
import { IsRequiredString } from '@presentation/validators/is-required-string.decorator';
import { Transform } from 'class-transformer';
import { trimString, trimUppercaseString } from '../../utils/transformers.util';

export class CreateCurrencyDto {
  @ApiProperty({
    description: 'Currency name.',
    example: 'US Dollar',
    minLength: 3,
    maxLength: 50,
  })
  @Transform(trimString)
  @IsRequiredString({ min: 3, max: 50 })
  name!: string;

  @ApiProperty({
    description: 'Currency code (ISO 4217 alpha-3).',
    example: 'USD',
    minLength: 3,
    maxLength: 3,
  })
  @Transform(trimUppercaseString)
  @IsRequiredString({ min: 3, max: 3 })
  currencyCode!: string;
}
