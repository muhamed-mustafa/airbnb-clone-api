import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class HttpErrorItemDto {
  @ApiProperty({
    description: 'HTTP-layer error code. The exact code depends on the operation and status.',
    example: 'errors.BAD_REQUEST',
  })
  code!: string;

  @ApiProperty({
    description: 'Localized error message.',
    example: 'Bad request',
  })
  message!: string;

  @ApiPropertyOptional({
    description: 'Request field related to the error, when applicable.',
  })
  field?: string;
}
