import { ApiProperty } from '@nestjs/swagger';

export class ValidationErrorItemDto {
  @ApiProperty({
    description: 'Validator constraint code, such as isEmail, isMongoId, or whitelistValidation.',
    example: 'isEmail',
  })
  code!: string;

  @ApiProperty({
    description: 'Request field that failed validation.',
    example: 'email',
  })
  field!: string;

  @ApiProperty({
    description: 'Localized validation error message.',
    example: 'Please provide a valid email address',
  })
  message!: string;
}
