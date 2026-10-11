import { ApiProperty } from '@nestjs/swagger';

export class UnitCategoryResponseDto {
  @ApiProperty({
    description: 'Unit category ID.',
    example: '670d1234567890abcdef1234',
  })
  id!: string;

  @ApiProperty({
    description: 'Accommodation type name (for example, apartment or villa).',
    example: 'villa',
  })
  name!: string;

  @ApiProperty({
    description: 'Opaque icon identifier for an accommodation type; not an upload or image URL.',
    example: 'villa',
  })
  icon!: string;
}
