import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, Max, Min, ValidateIf } from 'class-validator';

// Both fields are optional for an upsert (a partial update is valid), but a supplied value
// must be a valid number. ValidateIf (rather than IsOptional) skips only `undefined`, so an
// explicit `null` is still validated and rejected instead of reaching MongoDB.
const isProvided = (_object: unknown, value: unknown): boolean => value !== undefined;

export class UpsertAppSettingsDto {
  @ApiPropertyOptional({
    description: 'VAT rate as a percentage.',
    example: 14,
    minimum: 0,
    maximum: 25,
    default: 0,
  })
  @ValidateIf(isProvided)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Max(25)
  vatRate?: number;

  @ApiPropertyOptional({
    description: 'Minimum allowed listing price.',
    example: 500,
    minimum: 0,
    default: 0,
  })
  @ValidateIf(isProvided)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  minPrice?: number;
}
