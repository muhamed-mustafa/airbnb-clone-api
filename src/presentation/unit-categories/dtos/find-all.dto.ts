import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator';
import { PaginationDto } from '../../../common/pagination/pagination.dto';
import { trimString } from '../../utils/transformers.util';

export class FindAllDto extends PaginationDto {
  @ApiPropertyOptional({
    description: 'Partial unit category name.',
    example: 'weight',
    minLength: 3,
    maxLength: 50,
  })
  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(50)
  @Transform(trimString)
  name?: string;
}
