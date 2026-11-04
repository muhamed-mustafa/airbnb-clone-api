import { PickType } from '@nestjs/swagger';
import { UpdateUnitDto } from '@presentation/units/dtos/update-unit.dto';

export class UnitVersionDto extends PickType(UpdateUnitDto, ['expectedVersion'] as const) {}
