import { FindAllUnitsDto } from './find-all-units.dto';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsBoolean, IsOptional } from 'class-validator';

export class FindAllAdminUnitsDto extends FindAllUnitsDto {
  @IsOptional()
  @Transform(({ value }: { value: unknown }) =>
    value === 'true' ? true : value === 'false' ? false : value,
  )
  @IsBoolean()
  @ApiPropertyOptional({ description: 'Filter by whether the unit is active.', type: Boolean })
  isActive?: boolean;
}
