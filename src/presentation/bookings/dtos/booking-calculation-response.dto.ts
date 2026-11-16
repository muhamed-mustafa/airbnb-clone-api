import { ApiProperty } from '@nestjs/swagger';

export class BookingCalculationResponseDto {
  @ApiProperty({ description: 'Unit price per night.', minimum: 0, example: 1500 })
  pricePerDay!: number;

  @ApiProperty({
    description: 'Number of nights between check-in and check-out.',
    type: 'integer',
    minimum: 1,
    example: 5,
  })
  daysCount!: number;

  @ApiProperty({
    description: 'Subtotal for all requested nights before VAT.',
    minimum: 0,
    example: 7500,
  })
  bookingAmount!: number;

  @ApiProperty({ description: 'VAT rate used to calculate vatAmount.', minimum: 0 })
  vat!: number;

  @ApiProperty({
    description: 'VAT amount for the booking.',
    minimum: 0,
    example: 1050,
  })
  vatAmount!: number;

  @ApiProperty({
    description: 'Total booking amount including VAT.',
    minimum: 0,
    example: 8550,
  })
  totalAmount!: number;
}
