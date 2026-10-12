import { PartialType } from '@nestjs/swagger';
import { CreateUnitDto } from '@presentation/units/dtos/create-unit.dto';

export class UpdateUnitDto extends PartialType(CreateUnitDto) {}
