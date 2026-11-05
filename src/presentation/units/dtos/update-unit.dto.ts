import { ApiProperty, ApiPropertyOptional, OmitType, PartialType } from '@nestjs/swagger';
import { CreateUnitDto } from '@presentation/units/dtos/create-unit.dto';
import { ArrayUnique, IsArray, IsInt, IsString, Min, ValidateIf } from 'class-validator';

export class UpdateUnitDto extends PartialType(OmitType(CreateUnitDto, ['photos'] as const), {
  skipNullProperties: false,
}) {
  @ApiPropertyOptional({
    description: 'Photo references. Send an empty array to remove all photos.',
    type: [String],
    example: ['https://example.com/photo.jpg'],
  })
  @ValidateIf((_object: UpdateUnitDto, value: unknown) => value !== undefined)
  @IsArray()
  @ArrayUnique()
  @IsString({ each: true })
  photos?: string[];

  @ApiProperty({
    description: 'Expected version of the unit.',
    example: 1,
    minimum: 0,
  })
  @IsInt()
  @Min(0)
  expectedVersion!: number;
}
