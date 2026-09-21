import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  IsInt,
  IsOptional,
  IsString,
  Matches,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';
import { trimUppercaseString } from '../../utils/transformers.util';

export class FindAllDto {
  @ApiPropertyOptional({
    description: 'Country name.',
    example: 'Egypt',
    minLength: 3,
    maxLength: 50,
  })
  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(50)
  @Transform(trimUppercaseString)
  name?: string;

  @ApiPropertyOptional({
    description: 'Country code (ISO 3166-1 alpha-2).',
    example: 'EG',
    minLength: 2,
    maxLength: 2,
  })
  @IsOptional()
  @IsString()
  @Transform(trimUppercaseString)
  @Matches(/^[A-Z]{2}$/)
  code?: string;

  @ApiPropertyOptional({
    description: 'Page number.',
    example: 1,
    minimum: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @ApiPropertyOptional({
    description: 'Number of items per page.',
    example: 10,
    minimum: 1,
    maximum: 100,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number;
}
