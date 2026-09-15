import { ApiProperty } from '@nestjs/swagger';
import { InternalErrorItemDto } from './internal-error-item.dto';

export class InternalErrorResponseDto {
  @ApiProperty({
    type: [InternalErrorItemDto],
    description: 'List containing a single internal server error entry.',
  })
  errors!: InternalErrorItemDto[];
}
