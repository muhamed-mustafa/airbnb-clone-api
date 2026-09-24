import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsRequiredString,
  isOptionalString,
} from '@presentation/validators/is-required-string.decorator';
import { Transform } from 'class-transformer';
import { trimString } from '../../utils/transformers.util';

export class CreateUnitCategoryDto {
  @ApiProperty({
    description: 'Unit category name.',
    example: 'Weight',
    minLength: 3,
    maxLength: 50,
  })
  @Transform(trimString)
  @IsRequiredString({ min: 3, max: 50 })
  name!: string;

  @ApiPropertyOptional({
    description: 'Unit category icon identifier.',
    example: 'weight-icon',
    maxLength: 100,
  })
  @Transform(trimString)
  @isOptionalString({ max: 100 })
  icon?: string;
}
