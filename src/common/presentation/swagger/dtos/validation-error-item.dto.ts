import { ApiProperty } from '@nestjs/swagger';

export class ValidationErrorItemDto {
  @ApiProperty({
    description: 'Validation error code (i18n message key).',
    example: 'validation.isEmail',
  })
  code!: string;

  @ApiProperty({
    description: 'Request field that failed validation.',
    example: 'email',
  })
  field!: string;

  @ApiProperty({
    description: 'Localized validation error message.',
    example: 'email must be a valid email address',
  })
  message!: string;
}
