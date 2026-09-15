import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsEmail } from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';
import { trimString } from '../../utils/transformers.util';
import { IsRequiredString } from '../../validators/is-required-string.decorator';

export class CreateUserDto {
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
    description: 'Unique email address.',
    example: 'muhammedmostafa.dev@gmail.com',
    format: 'email',
  })
  @Transform(trimString)
  @IsRequiredString()
  @IsEmail(
    {},
    {
      message: i18nValidationMessage('validation.isEmail'),
    },
  )
  email!: string;

  @ApiProperty({
    description: 'Phone number in international E.164 format or local format stored as provided.',
    example: '+201555738344',
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
  @Transform(trimString)
  @IsRequiredString({ min: 8, max: 128 })
  password!: string;
}
