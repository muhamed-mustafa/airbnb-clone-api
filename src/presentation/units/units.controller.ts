import { ApiFindOneUnitDocs } from '@presentation/swagger/decorators/units/api-find-one-unit-docs.decorator';
import { ApiUpdateUnitDocs } from '@presentation/swagger/decorators/units/api-update-unit-docs.decorator';
import { UnitService } from '@application/units/services/unit.service';
import { Roles } from '@common/constants/roles.constant';
import type { JwtPayload } from '@common/interfaces/jwt-payload.interface';
import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '@presentation/auth/decorators/current-user.decorator';
import { AllowedRoles } from '@presentation/auth/decorators/roles.decorator';
import { ApiCreateUnitDocs } from '@presentation/swagger/decorators/units/api-create-unit-docs.decorator';
import { SWAGGER_TAGS } from '@presentation/swagger/swagger.constants';
import { CreateUnitDto } from '@presentation/units/dtos/create-unit.dto';
import { UnitResponseDto } from '@presentation/units/dtos/unit-response.dto';
import { UpdateUnitDto } from '@presentation/units/dtos/update-unit.dto';

@ApiTags(SWAGGER_TAGS.UNITS)
@Controller('units')
export class UnitsController {
  constructor(private readonly unitService: UnitService) {}

  @AllowedRoles(Roles.USER)
  @Post()
  @ApiCreateUnitDocs()
  async create(
    @Body() data: CreateUnitDto,
    @CurrentUser() user: JwtPayload,
  ): Promise<UnitResponseDto> {
    return await this.unitService.create({ ...data, user: user.id });
  }

  @AllowedRoles(Roles.USER)
  @Get(':id')
  @ApiFindOneUnitDocs()
  async findOne(@Param('id') id: string): Promise<UnitResponseDto | null> {
    return this.unitService.findOne({ id });
  }

  @AllowedRoles(Roles.USER)
  @Patch(':id')
  @ApiUpdateUnitDocs()
  async update(
    @Param('id') id: string,
    @Body() data: UpdateUnitDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.unitService.update(id, data, user.id);
  }
}
