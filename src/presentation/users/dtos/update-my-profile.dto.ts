import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsRequiredString } from '@presentation/validators/is-required-string.decorator';
import { trimString } from '@presentation/utils/transformers.util';

export class UpdateMyProfileDto {
  @ApiProperty({ minLength: 2, maxLength: 50, example: 'Muhammed Mustafa' })
  @Transform(trimString)
  @IsRequiredString({ min: 2, max: 50 })
  name!: string;
}
