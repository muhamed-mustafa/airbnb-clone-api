import { ApiProperty } from '@nestjs/swagger';
import { IsRequiredString } from '@presentation/validators/is-required-string.decorator';
import { Transform } from 'class-transformer';
import { IsMongoId } from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';
import { trimString } from '../../utils/transformers.util';

export class CurrencyIdDto {
  @ApiProperty({
    description: 'Currency ID.',
    example: '670d1234567890abcdef1234',
  })
  @Transform(trimString)
  @IsRequiredString()
  @IsMongoId({ message: i18nValidationMessage('validation.isMongoId') })
  id!: string;
}
