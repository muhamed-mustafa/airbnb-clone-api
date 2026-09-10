import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsEmail } from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';
import { normalizeEmail, trimString } from '../../../common/utils/transformers.util';
import { IsRequiredString } from '../../../common/validators/is-required-string.decorator';

export class RegisterDto {
  @ApiProperty({
    description: 'Full name of the user.',
    example: 'Muhammed Mustafa',
    minLength: 2,
    maxLength: 50,
  })
  @Transform(trimString)
  @IsRequiredString({ min: 2, max: 50 })
  name!: string;

  @ApiProperty({
    description: 'Unique email address. Normalized to lowercase on input.',
    example: 'muhammedmostafa.dev@gmail.com',
    format: 'email',
  })
  @Transform(normalizeEmail)
  @IsRequiredString()
  @IsEmail(
    {},
    {
      message: i18nValidationMessage('validation.isEmail'),
    },
  )
  email!: string;

  @ApiProperty({
    description: 'International dialing code including the leading plus sign.',
    example: '+20',
    minLength: 1,
  })
  @Transform(trimString)
  @IsRequiredString()
  countryCode!: string;

  @ApiProperty({
    description: 'Phone number without the country code. Validated against the country code.',
    example: '1555738344',
    minLength: 1,
  })
  @Transform(trimString)
  @IsRequiredString()
  phone!: string;

  @ApiProperty({
    description: 'Account password. Must be between 8 and 128 characters.',
    example: 'Password123!',
    format: 'password',
    minLength: 8,
    maxLength: 128,
    writeOnly: true,
  })
  @IsRequiredString({ min: 8, max: 128 })
  password!: string;
}
