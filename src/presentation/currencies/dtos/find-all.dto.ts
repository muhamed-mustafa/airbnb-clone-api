import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsOptional, IsString, Matches, MaxLength, MinLength } from 'class-validator';
import { PaginationDto } from '../../../common/pagination/pagination.dto';
import { trimUppercaseString } from '../../utils/transformers.util';

export class FindAllDto extends PaginationDto {
  @ApiPropertyOptional({
    description: 'Currency name.',
    example: 'Dollar',
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
    description: 'Currency code (ISO 4217 alpha-3).',
    example: 'USD',
    minLength: 3,
    maxLength: 3,
  })
  @IsOptional()
  @IsString()
  @Transform(trimUppercaseString)
  @Matches(/^[A-Z]{3}$/)
  currencyCode?: string;
}
