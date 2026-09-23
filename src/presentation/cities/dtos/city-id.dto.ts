import { ApiProperty } from '@nestjs/swagger';
import { IsRequiredString } from '@presentation/validators/is-required-string.decorator';
import { Transform } from 'class-transformer';
import { IsMongoId } from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';
import { trimString } from '../../utils/transformers.util';

export class CityIdDto {
  @ApiProperty({
    description: 'City ID.',
    example: '670d1234567890abcdef5678',
  })
  @Transform(trimString)
  @IsRequiredString()
  @IsMongoId({ message: i18nValidationMessage('validation.isMongoId') })
  id!: string;
}
