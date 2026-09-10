import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty } from 'class-validator';

export class LoginDto {
  @ApiProperty({
    description: 'Registered account email address.',
    example: 'muhammedmostafa.dev@gmail.com',
    format: 'email',
  })
  @IsNotEmpty()
  @IsEmail()
  email!: string;

  @ApiProperty({
    description: 'Account password.',
    example: 'Password123!',
    format: 'password',
    minLength: 1,
    writeOnly: true,
  })
  @IsNotEmpty()
  password!: string;
}
