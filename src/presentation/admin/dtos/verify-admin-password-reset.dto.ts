import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, Matches } from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';
import { IsRequiredString } from '@presentation/validators/is-required-string.decorator';

export class VerifyAdminPasswordResetDto {
  @ApiProperty({ example: 'admin@example.com', format: 'email' })
  @IsRequiredString()
  @IsEmail({}, { message: i18nValidationMessage('validation.isEmail') })
  email!: string;

  @ApiProperty({ example: '084251', minLength: 6, maxLength: 6 })
  @IsRequiredString({ min: 6, max: 6 })
  @Matches(/^\d{6}$/, { message: i18nValidationMessage('validation.matches') })
  code!: string;
}
