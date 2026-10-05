import { ApiProperty } from '@nestjs/swagger';

export class AdminResponseDto {
  @ApiProperty({
    description: 'Admin ID.',
    example: '670d1234567890abcdef1234',
  })
  id!: string;

  @ApiProperty({
    description: 'Admin name.',
    example: 'Egypt',
  })
  name!: string;

  @ApiProperty({
    description: 'Admin email address.',
    example: 'muhammedmostafa.dev@gmail.com',
    format: 'email',
  })
  email!: string;

  @ApiProperty({
    description: 'Admin super admin status.',
    example: true,
  })
  isSuperAdmin!: boolean;
}
