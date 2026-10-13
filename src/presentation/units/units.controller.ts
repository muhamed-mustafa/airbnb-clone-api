import { UnitService } from '@application/units/services/unit.service';
import { Roles } from '@common/constants/roles.constant';
import type { JwtPayload } from '@common/interfaces/jwt-payload.interface';
import { PaginatedResult } from '@common/pagination/pagination.types';
import { Body, Controller, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '@presentation/auth/decorators/current-user.decorator';
import { IsPublic } from '@presentation/auth/decorators/is-public.decorator';
import { AllowedRoles } from '@presentation/auth/decorators/roles.decorator';
import { ApiCreateUnitDocs } from '@presentation/swagger/decorators/units/api-create-unit-docs.decorator';
import { ApiFindAllUnitsDocs } from '@presentation/swagger/decorators/units/api-find-all-units-docs.decorator';
import { ApiFindOneUnitDocs } from '@presentation/swagger/decorators/units/api-find-one-unit-docs.decorator';
import { ApiUpdateUnitDocs } from '@presentation/swagger/decorators/units/api-update-unit-docs.decorator';
import { SWAGGER_TAGS } from '@presentation/swagger/swagger.constants';
import { CreateUnitDto } from '@presentation/units/dtos/create-unit.dto';
import { FindAllUnitsDto } from '@presentation/units/dtos/find-all-units.dto';
import { UnitResponseDto } from '@presentation/units/dtos/unit-response.dto';
import { UpdateUnitDto } from '@presentation/units/dtos/update-unit.dto';
import { UnitMapper } from '@presentation/units/mappers/unit.mapper';

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
    const input = UnitMapper.toCreateUnitInput(data);
    const output = await this.unitService.create({ ...input, user: user.id });
    return UnitMapper.toResponse(output);
  }

  @Get()
  @IsPublic()
  @ApiFindAllUnitsDocs()
  async findAll(@Query() query: FindAllUnitsDto): Promise<PaginatedResult<UnitResponseDto>> {
    const result = await this.unitService.findAll(query);
    return { ...result, data: result.data.map((unit) => UnitMapper.toResponse(unit)) };
  }

  @AllowedRoles(Roles.USER)
  @Get('me')
  async findMyUnits(
    @CurrentUser() user: JwtPayload,
    @Query() query: FindAllUnitsDto,
  ): Promise<PaginatedResult<UnitResponseDto>> {
    const result = await this.unitService.findMyUnits(user.id, query);
    return { ...result, data: result.data.map((unit) => UnitMapper.toResponse(unit)) };
  }

  @Get(':id')
  @IsPublic()
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
