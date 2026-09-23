import { ApiPropertyOptional } from '@nestjs/swagger';
import { isOptionalString } from '@presentation/validators/is-required-string.decorator';
import { Transform } from 'class-transformer';
import { IsMongoId } from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';
import { trimString } from '../../utils/transformers.util';
import { AtLeastOneField } from '../../validators/at-least-one-field.decorator';

export class UpdateCityDto {
  @AtLeastOneField(['name', 'country'])
  private readonly _atLeastOneField!: undefined;

  @ApiPropertyOptional({
    description: 'City name. Unique within its country.',
    example: 'Cairo',
    minLength: 3,
    maxLength: 50,
  })
  @Transform(trimString)
  @isOptionalString({ min: 3, max: 50 })
  name?: string;

  @ApiPropertyOptional({
    description: 'ID of an existing country.',
    example: '670d1234567890abcdef1234',
  })
  @Transform(trimString)
  @isOptionalString()
  @IsMongoId({ message: i18nValidationMessage('validation.isMongoId') })
  country?: string;
}
