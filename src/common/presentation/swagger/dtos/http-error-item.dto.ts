import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class HttpErrorItemDto {
  @ApiProperty({
    description: 'Application error code.',
    example: 'auth.USER_ALREADY_EXISTS',
  })
  code!: string;

  @ApiProperty({
    description: 'Localized error message.',
    example: 'User already exists',
  })
  message!: string;

  @ApiPropertyOptional({
    description: 'Request field related to the error, when applicable.',
    example: 'email',
  })
  field?: string;
}
