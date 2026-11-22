import { ApiProperty } from '@nestjs/swagger';
import { IsEmail } from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';
import { IsRequiredString } from '@presentation/validators/is-required-string.decorator';

export class RequestAdminPasswordResetDto {
  @ApiProperty({ example: 'admin@example.com', format: 'email' })
  @IsRequiredString()
  @IsEmail({}, { message: i18nValidationMessage('validation.isEmail') })
  email!: string;
}
