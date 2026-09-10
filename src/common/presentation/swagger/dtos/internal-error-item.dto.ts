import { ApiProperty } from '@nestjs/swagger';

export class InternalErrorItemDto {
  @ApiProperty({
    description: 'Generic internal server error message.',
    example: 'Internal server error',
  })
  message!: string;
}
