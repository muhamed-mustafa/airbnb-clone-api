import { ApiProperty } from '@nestjs/swagger';

export class UnitCategoryResponseDto {
  @ApiProperty({
    description: 'Unit category ID.',
    example: '670d1234567890abcdef1234',
  })
  id!: string;

  @ApiProperty({
    description: 'Unit category name.',
    example: 'weight',
  })
  name!: string;

  @ApiProperty({
    description: 'Unit category icon identifier.',
    example: 'weight-icon',
  })
  icon!: string;
}
