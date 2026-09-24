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
import { UnitCategoryService } from '../../application/unit-categories/services/unit-category.service';
import { PaginatedResult } from '../../common/pagination/pagination.types';
import { ApiCreateUnitCategoryDocs } from '../swagger/decorators/unit-categories/api-create-unit-category-docs.decorator';
import { ApiDeleteUnitCategoryDocs } from '../swagger/decorators/unit-categories/api-delete-unit-category-docs.decorator';
import { ApiFindAllUnitCategoriesDocs } from '../swagger/decorators/unit-categories/api-find-all-unit-categories-docs.decorator';
import { ApiFindUnitCategoryByIdDocs } from '../swagger/decorators/unit-categories/api-find-unit-category-by-id-docs.decorator';
import { ApiUpdateUnitCategoryDocs } from '../swagger/decorators/unit-categories/api-update-unit-category-docs.decorator';
import { SWAGGER_TAGS } from '../swagger/swagger.constants';
import { UnitCategoryIdDto } from './dtos/unit-category-id.dto';
import { UnitCategoryResponseDto } from './dtos/unit-category-response.dto';
import { CreateUnitCategoryDto } from './dtos/create-unit-category.dto';
import { FindAllDto } from './dtos/find-all.dto';
import { UpdateUnitCategoryDto } from './dtos/update-unit-category.dto';
import { UnitCategoryMapper } from './mappers/unit-category.mapper';

@ApiTags(SWAGGER_TAGS.UNIT_CATEGORIES)
@Controller('unit-categories')
export class UnitCategoryController {
  constructor(private readonly unitCategoryService: UnitCategoryService) {}

  @Post()
  @ApiCreateUnitCategoryDocs()
  async create(@Body() body: CreateUnitCategoryDto): Promise<UnitCategoryResponseDto> {
    const input = UnitCategoryMapper.toUnitCategoryInput(body);
    const output = await this.unitCategoryService.create(input);
    return UnitCategoryMapper.toResponse(output);
  }

  @Get()
  @ApiFindAllUnitCategoriesDocs()
  async findAll(@Query() query: FindAllDto): Promise<PaginatedResult<UnitCategoryResponseDto>> {
    const output = await this.unitCategoryService.findAll(query);

    return {
      data: output.data.map((unitCategory) => UnitCategoryMapper.toResponse(unitCategory)),
      meta: output.meta,
    };
  }

  @Get(':id')
  @ApiFindUnitCategoryByIdDocs()
  async findById(@Param() params: UnitCategoryIdDto): Promise<UnitCategoryResponseDto> {
    const output = await this.unitCategoryService.findById(params.id);
    return UnitCategoryMapper.toResponse(output);
  }

  @Patch(':id')
  @ApiUpdateUnitCategoryDocs()
  async update(
    @Param() params: UnitCategoryIdDto,
    @Body() body: UpdateUnitCategoryDto,
  ): Promise<UnitCategoryResponseDto> {
    const input = { name: body.name, icon: body.icon };
    const output = await this.unitCategoryService.update(params.id, input);
    return UnitCategoryMapper.toResponse(output);
  }

  @Delete(':id')
  @ApiDeleteUnitCategoryDocs()
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Param() params: UnitCategoryIdDto): Promise<void> {
    await this.unitCategoryService.delete(params.id);
  }
}
