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
import { CityService } from '@application/cities/services/city.service';
import { PaginatedResult } from '@common/pagination/pagination.types';
import { ApiCreateCityDocs } from '../swagger/decorators/cities/api-create-city-docs.decorator';
import { ApiDeleteCityDocs } from '../swagger/decorators/cities/api-delete-city-docs.decorator';
import { ApiFindAllCitiesDocs } from '../swagger/decorators/cities/api-find-all-cities-docs.decorator';
import { ApiFindCityByIdDocs } from '../swagger/decorators/cities/api-find-city-by-id-docs.decorator';
import { ApiUpdateCityDocs } from '../swagger/decorators/cities/api-update-city-docs.decorator';
import { SWAGGER_TAGS } from '../swagger/swagger.constants';
import { CityIdDto } from './dtos/city-id.dto';
import { CityResponseDto } from './dtos/city-response.dto';
import { CreateCityDto } from './dtos/create-city.dto';
import { FindAllCitiesDto } from './dtos/find-all-cities.dto';
import { UpdateCityDto } from './dtos/update-city.dto';
import { CityMapper } from './mappers/city.mapper';

@ApiTags(SWAGGER_TAGS.CITIES)
@Controller('cities')
export class CityController {
  constructor(private readonly cityService: CityService) {}

  @Post()
  @ApiCreateCityDocs()
  async create(@Body() body: CreateCityDto): Promise<CityResponseDto> {
    const input = CityMapper.toCreateCityInput(body);
    const output = await this.cityService.create(input);
    return CityMapper.toResponse(output);
  }

  @Get()
  @ApiFindAllCitiesDocs()
  async findAll(@Query() query: FindAllCitiesDto): Promise<PaginatedResult<CityResponseDto>> {
    const output = await this.cityService.findAll(query);

    return {
      data: output.data.map((city) => CityMapper.toResponse(city)),
      meta: output.meta,
    };
  }

  @Get(':id')
  @ApiFindCityByIdDocs()
  async findById(@Param() params: CityIdDto): Promise<CityResponseDto> {
    const output = await this.cityService.findById(params.id);
    return CityMapper.toResponse(output);
  }

  @Patch(':id')
  @ApiUpdateCityDocs()
  async update(@Param() params: CityIdDto, @Body() body: UpdateCityDto): Promise<CityResponseDto> {
    const input = CityMapper.toUpdateCityInput(body);
    const output = await this.cityService.update(params.id, input);
    return CityMapper.toResponse(output);
  }

  @Delete(':id')
  @ApiDeleteCityDocs()
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Param() params: CityIdDto): Promise<void> {
    await this.cityService.delete(params.id);
  }
}
