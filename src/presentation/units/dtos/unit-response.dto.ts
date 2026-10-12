import { ApiProperty } from '@nestjs/swagger';
export class UnitResponseDto {
  @ApiProperty({
    description: 'Unit MongoDB ObjectId.',
    example: '670d1234567890abcdef1237',
  })
  id!: string;
  @ApiProperty({
    description: 'Owner user MongoDB ObjectId, assigned from the access token on creation.',
    example: '670d1234567890abcdef1238',
    pattern: '^[a-fA-F0-9]{24}$',
  })
  user!: string;
  @ApiProperty({
    description: 'Accommodation title.',
    example: 'Spacious apartment near the sea',
    minLength: 5,
    maxLength: 100,
  })
  title!: string;
  @ApiProperty({
    description: 'Non-empty accommodation description.',
    example: 'A furnished apartment with two bedrooms and a kitchen.',
    minLength: 1,
  })
  description!: string;
  @ApiProperty({
    description: 'Non-empty street address.',
    example: '12 Corniche Road, Alexandria',
    minLength: 1,
  })
  address!: string;
  @ApiProperty({
    description:
      'At least one photo reference as a string. Files are not uploaded by this endpoint; URL format is not validated.',
    type: [String],
    minItems: 1,
    example: ['https://example.com/photos/apartment-1.jpg'],
  })
  photos!: string[];
  @ApiProperty({
    description:
      'Daily accommodation cost, at least 1 and not below the configured minPrice. No currency field is accepted.',
    example: 1500,
    minimum: 1,
  })
  costPerDay!: number;
  @ApiProperty({
    description: 'Existing country MongoDB ObjectId.',
    example: '670d1234567890abcdef1234',
    pattern: '^[a-fA-F0-9]{24}$',
  })
  country!: string;
  @ApiProperty({
    description: 'Existing city MongoDB ObjectId.',
    example: '670d1234567890abcdef1235',
    pattern: '^[a-fA-F0-9]{24}$',
  })
  city!: string;
  @ApiProperty({
    description: 'Existing accommodation type MongoDB ObjectId (such as villa or apartment).',
    example: '670d1234567890abcdef1236',
    pattern: '^[a-fA-F0-9]{24}$',
  })
  unitCategory!: string;
  @ApiProperty({ description: 'Number of rooms.', type: 'integer', minimum: 1, example: 2 })
  roomsCount!: number;
  @ApiProperty({ description: 'Adult capacity.', type: 'integer', minimum: 1, example: 4 })
  adultsCount!: number;
  @ApiProperty({
    description: 'Child capacity; zero is allowed.',
    type: 'integer',
    minimum: 0,
    example: 0,
  })
  kidsCount!: number;

  @ApiProperty({ description: 'Whether internet service is available.', example: true })
  hasInternetService!: boolean;

  @ApiProperty({ description: 'Whether a kitchen is available.', example: true })
  hasKitchen!: boolean;

  @ApiProperty({ description: 'Whether a private garage is available.', example: false })
  hasPrivateGarage!: boolean;

  @ApiProperty({ description: 'Whether the accommodation is available.', example: true })
  availability!: boolean;
}
