import { ApiProperty } from '@nestjs/swagger';
import { IsRequiredString } from '@presentation/validators/is-required-string.decorator';
import { Transform } from 'class-transformer';
import { IsMongoId } from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';
import { trimString } from '../../utils/transformers.util';

export class CreateCityDto {
  @ApiProperty({
    description: 'City name. Unique within its country.',
    example: 'Cairo',
    minLength: 3,
    maxLength: 50,
  })
  @Transform(trimString)
  @IsRequiredString({ min: 3, max: 50 })
  name!: string;

  @ApiProperty({
    description: 'ID of an existing country.',
    example: '670d1234567890abcdef1234',
  })
  @Transform(trimString)
  @IsRequiredString()
  @IsMongoId({ message: i18nValidationMessage('validation.isMongoId') })
  country!: string;
}
