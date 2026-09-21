import { ApiPropertyOptional } from '@nestjs/swagger';
import { isOptionalString } from '@presentation/validators/is-required-string.decorator';
import { Transform } from 'class-transformer';
import { trimString, trimUppercaseString } from '../../utils/transformers.util';
import { AtLeastOneField } from '../../validators/at-least-one-field.decorator';

export class UpdateCountryDto {
  @AtLeastOneField(['name', 'code'])
  private readonly _atLeastOneField!: undefined;

  @ApiPropertyOptional({
    description: 'Country name.',
    example: 'Egypt',
    minLength: 3,
    maxLength: 50,
  })
  @Transform(trimString)
  @isOptionalString({ min: 3, max: 50 })
  name!: string;

  @ApiPropertyOptional({
    description: 'Country code.',
    example: 'EG',
    minLength: 2,
    maxLength: 2,
  })
  @Transform(trimUppercaseString)
  @isOptionalString({ min: 2, max: 2 })
  code!: string;
}
