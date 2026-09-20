import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

export class FindAllDto {
  @ApiPropertyOptional({
    description: 'Country name.',
    example: 'Egypt',
  })
  @IsOptional()
  @IsString()
  name!: string;

  @ApiPropertyOptional({
    description: 'Country code.',
    example: 'EG',
  })
  @IsOptional()
  @IsString()
  code!: string;

  @ApiPropertyOptional({
    description: 'Page number.',
    example: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page!: number;

  @ApiPropertyOptional({
    description: 'Number of items per page.',
    example: 10,
    minimum: 1,
    maximum: 100,
  })
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  @Min(1)
  @Max(100)
  limit!: number;
}
