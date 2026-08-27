import { Transform } from 'class-transformer';
import { IsEmail } from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';
import { normalizeEmail, trimString } from '../../common/utils/transformers.util';
import { IsRequiredString } from '../../common/validators/is-required-string.decorator';

export class RegisterDto {
  @Transform(trimString)
  @IsRequiredString({ min: 2, max: 50 })
  name!: string;

  @Transform(normalizeEmail)
  @IsRequiredString()
  @IsEmail(
    {},
    {
      message: i18nValidationMessage('validation.isEmail'),
    },
  )
  email!: string;

  @Transform(trimString)
  @IsRequiredString()
  countryCode!: string;

  @Transform(trimString)
  @IsRequiredString()
  phone!: string;

  @IsRequiredString({ min: 8, max: 128 })
  password!: string;
}
