import { ApiProperty } from '@nestjs/swagger';

export class CurrencyResponseDto {
  @ApiProperty({
    description: 'Currency ID.',
    example: '670d1234567890abcdef1234',
  })
  id!: string;

  @ApiProperty({
    description: 'Currency name.',
    example: 'US Dollar',
  })
  name!: string;

  @ApiProperty({
    description: 'Currency code.',
    example: 'USD',
  })
  currencyCode!: string;
}
