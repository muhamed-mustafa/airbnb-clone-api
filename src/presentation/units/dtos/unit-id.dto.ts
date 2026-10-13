import { ApiProperty } from '@nestjs/swagger';
import { IsMongoId } from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';
export class UnitIdDto {
  @ApiProperty({
    description: 'Unit MongoDB ObjectId.',
    pattern: '^[a-fA-F0-9]{24}$',
    example: '670d1234567890abcdef1237',
  })
  @IsMongoId({ message: i18nValidationMessage('validation.isMongoId') })
  id!: string;
}
