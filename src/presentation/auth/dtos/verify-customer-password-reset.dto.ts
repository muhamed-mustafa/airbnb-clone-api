import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, Matches } from 'class-validator';

export class VerifyCustomerPasswordResetDto {
  @ApiProperty({ example: 'guest@example.com' })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: '123456', minLength: 6, maxLength: 6 })
  @Matches(/^\d{6}$/)
  code!: string;
}
