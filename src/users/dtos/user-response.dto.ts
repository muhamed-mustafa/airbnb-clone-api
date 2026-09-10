import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';

export class UserResponseDto {
  @ApiProperty({
    description: 'Unique user identifier.',
    example: '670d1234567890abcdef1234',
  })
  @Expose()
  id!: string;

  @ApiProperty({
    description: 'Full name of the user.',
    example: 'Muhammed Mustafa',
  })
  @Expose()
  name!: string;

  @ApiProperty({
    description: 'User email address.',
    example: 'muhammedmostafa.dev@gmail.com',
    format: 'email',
  })
  @Expose()
  email!: string;

  @ApiProperty({
    description: 'User phone number.',
    example: '+201555738344',
  })
  @Expose()
  phone!: string;

  @Exclude()
  password!: string;
}
