import { ApiProperty } from '@nestjs/swagger';
import { Matches } from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';
import { IsRequiredString } from '@presentation/validators/is-required-string.decorator';

export class CompleteAdminPasswordResetDto {
  @ApiProperty({ description: 'Single-use reset token returned after code verification.' })
  @IsRequiredString({ min: 43, max: 43 })
  resetToken!: string;

  @ApiProperty({
    minLength: 15,
    maxLength: 128,
    writeOnly: true,
    description:
      'Must include uppercase and lowercase letters, a number, and a symbol; no character may repeat five times in a row.',
  })
  @IsRequiredString({ min: 15, max: 128 })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9\s]).+$/, {
    message: i18nValidationMessage('validation.password'),
  })
  @Matches(/^(?!.*(.)\1{4,})/s, {
    message: i18nValidationMessage('validation.passwordRepeatedCharacters'),
  })
  newPassword!: string;
}
