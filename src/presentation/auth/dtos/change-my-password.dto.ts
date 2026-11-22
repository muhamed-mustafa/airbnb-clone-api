import { ApiProperty } from '@nestjs/swagger';
import { IsRequiredString } from '@presentation/validators/is-required-string.decorator';

export class ChangeMyPasswordDto {
  @ApiProperty({ format: 'password', writeOnly: true })
  @IsRequiredString()
  currentPassword!: string;

  @ApiProperty({ format: 'password', writeOnly: true, minLength: 8, maxLength: 128 })
  @IsRequiredString({ min: 8, max: 128 })
  newPassword!: string;
}
