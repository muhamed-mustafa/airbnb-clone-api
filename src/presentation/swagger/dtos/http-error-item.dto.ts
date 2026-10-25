import type { ErrorResponseInterface } from '../../errors/error-response.interface';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class HttpErrorItemDto implements ErrorResponseInterface {
  @ApiProperty({
    description: 'Error code. The exact code depends on the operation and status.',
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
