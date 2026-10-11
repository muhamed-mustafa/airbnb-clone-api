import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsRequiredString,
  isOptionalString,
} from '@presentation/validators/is-required-string.decorator';
import { Transform } from 'class-transformer';
import { trimString } from '../../utils/transformers.util';

export class CreateUnitCategoryDto {
  @ApiProperty({
    description: 'Accommodation type name (for example, apartment or villa).',
    example: 'Villa',
    minLength: 3,
    maxLength: 50,
  })
  @Transform(trimString)
  @IsRequiredString({ min: 3, max: 50 })
  name!: string;

  @ApiPropertyOptional({
    description: 'Opaque icon identifier for an accommodation type; not an upload or image URL.',
    example: 'villa',
    maxLength: 100,
  })
  @Transform(trimString)
  @isOptionalString({ max: 100 })
  icon?: string;
}
