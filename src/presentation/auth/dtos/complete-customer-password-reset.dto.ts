import { ApiProperty } from '@nestjs/swagger';
import { IsString, Length } from 'class-validator';

export class CompleteCustomerPasswordResetDto {
  @ApiProperty({ description: 'Single-use token returned after code verification.' })
  @IsString()
  @Length(43, 43)
  resetToken!: string;

  @ApiProperty({ minLength: 8, maxLength: 128 })
  @IsString()
  @Length(8, 128)
  newPassword!: string;
}
