import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsOptional, IsString, Matches, MaxLength, MinLength } from 'class-validator';
import { PaginationDto } from '../../../common/pagination/pagination.dto';
import { trimUppercaseString } from '../../utils/transformers.util';

export class FindAllDto extends PaginationDto {
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
}
