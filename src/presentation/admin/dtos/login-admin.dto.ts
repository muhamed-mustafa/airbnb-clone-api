import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty } from 'class-validator';

export class LoginAdminDto {
  @ApiProperty({
    description: 'Registered admin email address.',
    example: 'muhammedmostafa.dev@gmail.com',
    format: 'email',
  })
  @IsNotEmpty()
  @IsEmail()
  email!: string;

  @ApiProperty({
    description: 'Admin account password.',
    example: 'Password123!',
    format: 'password',
    minLength: 1,
    writeOnly: true,
  })
  @IsNotEmpty()
  password!: string;
}
