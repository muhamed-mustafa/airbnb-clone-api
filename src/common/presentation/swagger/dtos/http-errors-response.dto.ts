import { ApiProperty } from '@nestjs/swagger';
import { HttpErrorItemDto } from './http-error-item.dto';

export class HttpErrorsResponseDto {
  @ApiProperty({
    type: [HttpErrorItemDto],
    description: 'List of HTTP-layer errors.',
  })
  errors!: HttpErrorItemDto[];
}
