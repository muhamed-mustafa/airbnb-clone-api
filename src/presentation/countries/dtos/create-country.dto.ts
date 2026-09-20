import { ApiProperty } from '@nestjs/swagger';
import { IsRequiredString } from '@presentation/validators/is-required-string.decorator';
import { Transform } from 'class-transformer';
import { trimString } from '../../utils/transformers.util';

export class CreateCountryDto {
  @ApiProperty({
    description: 'Country name.',
    example: 'Egypt',
    minLength: 3,
    maxLength: 50,
  })
  @Transform(trimString)
  @IsRequiredString({ min: 3, max: 50 })
  name!: string;

  @ApiProperty({
    description: 'Country code.',
    example: 'EG',
    minLength: 2,
    maxLength: 2,
  })
  @Transform(trimString)
  @IsRequiredString({ min: 2, max: 2 })
  code!: string;
}
