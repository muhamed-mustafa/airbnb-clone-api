import { ApiProperty } from '@nestjs/swagger';
import { ValidationErrorItemDto } from './validation-error-item.dto';

export class ValidationErrorsResponseDto {
  @ApiProperty({
    type: [ValidationErrorItemDto],
    description: 'List of validation errors for one or more request fields.',
  })
  errors!: ValidationErrorItemDto[];
}
