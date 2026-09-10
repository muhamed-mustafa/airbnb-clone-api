import { ApiProperty } from '@nestjs/swagger';

export class ApplicationErrorResponseDto {
  @ApiProperty({
    description: 'Application error code.',
    example: 'INVALID_CREDENTIALS',
    enum: ['INVALID_CREDENTIALS', 'INVALID_TOKEN', 'INVALID_PHONE_NUMBER'],
  })
  code!: string;

  @ApiProperty({
    description: 'Localized error message.',
    example: 'Invalid credentials',
  })
  message!: string;
}
