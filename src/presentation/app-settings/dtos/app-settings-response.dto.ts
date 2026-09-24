import { ApiProperty } from '@nestjs/swagger';

export class AppSettingsResponseDto {
  @ApiProperty({
    description: 'VAT rate as a percentage.',
    example: 14,
  })
  vatRate!: number;

  @ApiProperty({
    description: 'Minimum allowed listing price.',
    example: 500,
  })
  minPrice!: number;
}
