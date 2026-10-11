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
  @IsString()
  @MinLength(5)
  @MaxLength(100)
  title!: string;

  @IsString()
  @IsNotEmpty()
  description!: string;

  @IsString()
  @IsNotEmpty()
  address!: string;

  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  photos!: string[];

  @IsNumber()
  @Min(1)
  costPerDay!: number;

  @IsMongoId()
  country!: string;

  @IsMongoId()
  city!: string;

  @IsMongoId()
  unitCategory!: string;

  @IsInt()
  @Min(1)
  roomsCount!: number;

  @IsInt()
  @Min(1)
  adultsCount!: number;

  @IsInt()
  @Min(0)
  kidsCount!: number;

  @IsBoolean()
  hasInternetService!: boolean;

  @IsBoolean()
  hasKitchen!: boolean;

  @IsBoolean()
  hasPrivateGarage!: boolean;
}
