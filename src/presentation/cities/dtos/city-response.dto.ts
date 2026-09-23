import { ApiProperty } from '@nestjs/swagger';

export class CityResponseDto {
  @ApiProperty({
    description: 'City ID.',
    example: '670d1234567890abcdef5678',
  })
  id!: string;

  @ApiProperty({
    description: 'City name, stored in lowercase.',
    example: 'cairo',
  })
  name!: string;

  @ApiProperty({
    description: 'ID of the country the city belongs to.',
    example: '670d1234567890abcdef1234',
  })
  country!: string;
}
