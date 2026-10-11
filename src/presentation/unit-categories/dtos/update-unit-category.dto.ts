import { ApiPropertyOptional } from '@nestjs/swagger';
import { isOptionalString } from '@presentation/validators/is-required-string.decorator';
import { Transform } from 'class-transformer';
import { trimString } from '../../utils/transformers.util';
import { AtLeastOneField } from '../../validators/at-least-one-field.decorator';

export class UpdateUnitCategoryDto {
  @AtLeastOneField(['name', 'icon'])
  private readonly _atLeastOneField!: undefined;

  @ApiPropertyOptional({
    description: 'Accommodation type name (for example, apartment or villa).',
    example: 'Villa',
    minLength: 3,
    maxLength: 50,
  })
  @Transform(trimString)
  @isOptionalString({ min: 3, max: 50 })
  name!: string;

  @ApiPropertyOptional({
    description: 'Opaque icon identifier for an accommodation type; not an upload or image URL.',
    example: 'villa',
    maxLength: 100,
  })
  @Transform(trimString)
  @isOptionalString({ max: 100 })
  icon!: string;
}
