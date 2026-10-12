import { UnitService } from '@application/units/services/unit.service';
import { Roles } from '@common/constants/roles.constant';
import type { JwtPayload } from '@common/interfaces/jwt-payload.interface';
import { Body, Controller, Post } from '@nestjs/common';
import { CurrentUser } from '@presentation/auth/decorators/current-user.decorator';
import { AllowedRoles } from '@presentation/auth/decorators/roles.decorator';
import { CreateUnitDto } from '@presentation/units/dtos/create-unit.dto';
import { UnitResponseDto } from '@presentation/units/dtos/unit-response.dto';

@Controller('units')
export class UnitsController {
  constructor(private readonly unitService: UnitService) {}

  @AllowedRoles(Roles.USER)
  @Post()
  async createUnit(
    @Body() data: CreateUnitDto,
    @CurrentUser() user: JwtPayload,
  ): Promise<UnitResponseDto> {
    return await this.unitService.create({ ...data, user: user.id });
  }
}
