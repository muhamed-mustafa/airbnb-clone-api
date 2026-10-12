import { ApiProperty } from '@nestjs/swagger';
import {
  ArrayNotEmpty,
  IsArray,
  IsBoolean,
  IsInt,
  IsMongoId,
  IsNotEmpty,
  IsNumber,
  IsString,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

export class CreateUnitDto {
  @ApiProperty({
    description: 'Accommodation title.',
    example: 'Spacious apartment near the sea',
    minLength: 5,
    maxLength: 100,
  })
  @IsString()
  @MinLength(5)
  @MaxLength(100)
  title!: string;

  @ApiProperty({
    description: 'Non-empty accommodation description.',
    example: 'A furnished apartment with two bedrooms and a kitchen.',
    minLength: 1,
  })
  @IsString()
  @IsNotEmpty()
  description!: string;

  @ApiProperty({
    description: 'Non-empty street address.',
    example: '12 Corniche Road, Alexandria',
    minLength: 1,
  })
  @IsString()
  @IsNotEmpty()
  address!: string;

  @ApiProperty({
    description:
      'At least one photo reference as a string. Files are not uploaded by this endpoint; URL format is not validated.',
    type: [String],
    minItems: 1,
    example: ['https://example.com/photos/apartment-1.jpg'],
  })
  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  photos!: string[];

  @ApiProperty({
    description:
      'Daily accommodation cost, at least 1 and not below the configured minPrice. No currency field is accepted.',
    example: 1500,
    minimum: 1,
  })
  @IsNumber()
  @Min(1)
  costPerDay!: number;

  @ApiProperty({
    description: 'Existing country MongoDB ObjectId.',
    example: '670d1234567890abcdef1234',
    pattern: '^[a-fA-F0-9]{24}$',
  })
  @IsMongoId()
  country!: string;

  @ApiProperty({
    description: 'Existing city MongoDB ObjectId.',
    example: '670d1234567890abcdef1235',
    pattern: '^[a-fA-F0-9]{24}$',
  })
  @IsMongoId()
  city!: string;

  @ApiProperty({
    description: 'Existing accommodation type MongoDB ObjectId (such as villa or apartment).',
    example: '670d1234567890abcdef1236',
    pattern: '^[a-fA-F0-9]{24}$',
  })
  @IsMongoId()
  unitCategory!: string;

  @ApiProperty({ description: 'Number of rooms.', type: 'integer', minimum: 1, example: 2 })
  @IsInt()
  @Min(1)
  roomsCount!: number;

  @ApiProperty({ description: 'Adult capacity.', type: 'integer', minimum: 1, example: 4 })
  @IsInt()
  @Min(1)
  adultsCount!: number;

  @ApiProperty({
    description: 'Child capacity; zero is allowed.',
    type: 'integer',
    minimum: 0,
    example: 0,
  })
  @IsInt()
  @Min(0)
  kidsCount!: number;

  @ApiProperty({ description: 'Whether internet service is available.', example: true })
  @IsBoolean()
  hasInternetService!: boolean;

  @ApiProperty({ description: 'Whether a kitchen is available.', example: true })
  @IsBoolean()
  hasKitchen!: boolean;

  @ApiProperty({ description: 'Whether a private garage is available.', example: false })
  @IsBoolean()
  hasPrivateGarage!: boolean;

  @ApiProperty({ description: 'Whether the accommodation is available.', example: true })
  @IsBoolean()
  availability!: boolean;
}
