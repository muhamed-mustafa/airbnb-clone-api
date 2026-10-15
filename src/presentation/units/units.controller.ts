import { UnitService } from '@application/units/services/unit.service';
import { Roles } from '@common/constants/roles.constant';
import type { JwtPayload } from '@common/interfaces/jwt-payload.interface';
import { PaginatedResult } from '@common/pagination/pagination.types';
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '@presentation/auth/decorators/current-user.decorator';
import { IsPublic } from '@presentation/auth/decorators/is-public.decorator';
import { AllowedRoles } from '@presentation/auth/decorators/roles.decorator';
import { ApiActivateUnitDocs } from '@presentation/swagger/decorators/units/api-activate-unit-docs.decorator';
import { ApiCreateUnitDocs } from '@presentation/swagger/decorators/units/api-create-unit-docs.decorator';
import { ApiDeactivateUnitDocs } from '@presentation/swagger/decorators/units/api-deactivate-unit-docs.decorator';
import { ApiDeleteUnitDocs } from '@presentation/swagger/decorators/units/api-delete-unit-docs.decorator';
import { ApiFindAllUnitsDocs } from '@presentation/swagger/decorators/units/api-find-all-units-docs.decorator';
import { ApiFindMyUnitsDocs } from '@presentation/swagger/decorators/units/api-find-my-units-docs.decorator';
import { ApiFindOneUnitDocs } from '@presentation/swagger/decorators/units/api-find-one-unit-docs.decorator';
import { ApiUpdateUnitDocs } from '@presentation/swagger/decorators/units/api-update-unit-docs.decorator';
import { SWAGGER_TAGS } from '@presentation/swagger/swagger.constants';
import { CreateUnitDto } from '@presentation/units/dtos/create-unit.dto';
import { FindAllUnitsDto } from '@presentation/units/dtos/find-all-units.dto';
import { UnitResponseDto } from '@presentation/units/dtos/unit-response.dto';
import { UpdateUnitDto } from '@presentation/units/dtos/update-unit.dto';
import { UnitMapper } from '@presentation/units/mappers/unit.mapper';
import { UnitIdDto } from './dtos/unit-id.dto';

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
    const result = await this.unitService.findAll({ ...query, isActive: true });
    return { ...result, data: result.data.map((unit) => UnitMapper.toResponse(unit)) };
  }

  @AllowedRoles(Roles.USER)
  @Get('me')
  @ApiFindMyUnitsDocs()
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
  async findOne(@Param() { id }: UnitIdDto): Promise<UnitResponseDto> {
    const unit = await this.unitService.findOne({ id, isActive: true });
    return UnitMapper.toResponse(unit);
  }

  @AllowedRoles(Roles.USER)
  @Patch(':id')
  @ApiUpdateUnitDocs()
  async update(
    @Param() { id }: UnitIdDto,
    @Body() data: UpdateUnitDto,
    @CurrentUser() user: JwtPayload,
  ) {
    const input = UnitMapper.toUpdateUnitInput(data);
    const output = await this.unitService.update(id, input, user.id);
    return UnitMapper.toResponse(output);
  }

  @AllowedRoles(Roles.USER)
  @Patch(':id/activate')
  @ApiActivateUnitDocs()
  async activate(
    @Param() { id }: UnitIdDto,
    @CurrentUser() user: JwtPayload,
  ): Promise<UnitResponseDto> {
    return UnitMapper.toResponse(await this.unitService.activate(id, user.id));
  }

  @AllowedRoles(Roles.USER)
  @Patch(':id/deactivate')
  @ApiDeactivateUnitDocs()
  async deactivate(
    @Param() { id }: UnitIdDto,
    @CurrentUser() user: JwtPayload,
  ): Promise<UnitResponseDto> {
    return UnitMapper.toResponse(await this.unitService.deactivate(id, user.id));
  }

  @AllowedRoles(Roles.USER)
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiDeleteUnitDocs()
  async delete(@Param() { id }: UnitIdDto, @CurrentUser() user: JwtPayload): Promise<void> {
    await this.unitService.delete(id, user.id);
  }
}
