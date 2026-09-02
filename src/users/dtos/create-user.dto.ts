import { Transform } from 'class-transformer';
import { IsEmail } from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';
import { trimString } from '../../common/utils/transformers.util';
import { IsRequiredString } from '../../common/validators/is-required-string.decorator';

export class CreateUserDto {
  @Transform(trimString)
  @IsRequiredString({ min: 2, max: 50 })
  name!: string;

  @Transform(trimString)
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
  phone!: string;

  @Transform(trimString)
  @IsRequiredString({ min: 8, max: 128 })
  password!: string;
}
