import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsOptional, IsString, Matches, MaxLength, MinLength } from 'class-validator';
import { PaginationDto } from '../../../common/pagination/pagination.dto';
import { trimUppercaseString } from '../../utils/transformers.util';

export class FindAllDto extends PaginationDto {
  @ApiPropertyOptional({
    description: 'Admin name.',
    example: 'Egypt',
    minLength: 3,
    maxLength: 50,
  })
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  @Transform(trimUppercaseString)
  name?: string;

  @ApiPropertyOptional({
    description: 'Admin email.',
    example: 'YK0Gt@example.com',
    format: 'email',
  })
  @IsOptional()
  @IsString()
  @Matches(/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/)
  email?: string;

  @ApiPropertyOptional({
    description: 'Admin super admin status.',
    example: true,
  })
  @IsOptional()
  @IsString()
  isSuperAdmin?: boolean;
}
