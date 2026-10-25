import type { ErrorsResponseInterface } from '../../errors/error-response.interface';
import { ApiProperty } from '@nestjs/swagger';
import { HttpErrorItemDto } from './http-error-item.dto';

export class HttpErrorsResponseDto implements ErrorsResponseInterface {
  @ApiProperty({
    type: [HttpErrorItemDto],
    description: 'List of API errors.',
  })
  errors!: HttpErrorItemDto[];
}
