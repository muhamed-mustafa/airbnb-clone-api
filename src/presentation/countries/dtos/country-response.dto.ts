import { ApiProperty } from '@nestjs/swagger';

export class CountryResponseDto {
  @ApiProperty({
    description: 'Country ID.',
    example: '670d1234567890abcdef1234',
  })
  id!: string;

  @ApiProperty({
    description: 'Country name.',
    example: 'Egypt',
  })
  name!: string;

  @ApiProperty({
    description: 'Country code.',
    example: 'EG',
  })
  code!: string;
}
