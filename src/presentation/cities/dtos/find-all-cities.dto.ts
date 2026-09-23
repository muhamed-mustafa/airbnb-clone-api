import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsMongoId, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';
import { PaginationDto } from '@common/pagination/pagination.dto';
import { trimString } from '../../utils/transformers.util';

export class FindAllCitiesDto extends PaginationDto {
  @ApiPropertyOptional({
    description: 'Partial city name (literal, case-insensitive).',
    example: 'cai',
    minLength: 3,
    maxLength: 50,
  })
  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(50)
  @Transform(trimString)
  name?: string;

  @ApiPropertyOptional({
    description: 'Exact country ID.',
    example: '670d1234567890abcdef1234',
  })
  @IsOptional()
  @Transform(trimString)
  @IsMongoId({ message: i18nValidationMessage('validation.isMongoId') })
  country?: string;
}
