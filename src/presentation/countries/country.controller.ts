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
import { CountryService } from '../../application/countries/services/country.service';
import { PaginatedResult } from '../../common/pagination/pagination.types';
import { ApiCreateCountryDocs } from '../swagger/decorators/countries/api-create-country-docs.decorator';
import { ApiDeleteCountryDocs } from '../swagger/decorators/countries/api-delete-country-docs.decorator';
import { ApiFindAllCountriesDocs } from '../swagger/decorators/countries/api-find-all-countries-docs.decorator';
import { ApiFindCountryByIdDocs } from '../swagger/decorators/countries/api-find-country-by-id-docs.decorator';
import { ApiUpdateCountryDocs } from '../swagger/decorators/countries/api-update-country-docs.decorator';
import { SWAGGER_TAGS } from '../swagger/swagger.constants';
import { CountryIdDto } from './dtos/country-id.dto';
import { CountryResponseDto } from './dtos/country-response.dto';
import { CreateCountryDto } from './dtos/create-country.dto';
import { FindAllDto } from './dtos/find-all.dto';
import { UpdateCountryDto } from './dtos/update-country.dto';
import { CountryMapper } from './mappers/country.mapper';

@ApiTags(SWAGGER_TAGS.COUNTRIES)
@Controller('countries')
export class CountryController {
  constructor(private readonly countryService: CountryService) {}

  @Post()
  @ApiCreateCountryDocs()
  async create(@Body() body: CreateCountryDto): Promise<CountryResponseDto> {
    const input = CountryMapper.toCountryInput(body);
    const output = await this.countryService.create(input);
    return CountryMapper.toResponse(output);
  }

  @Get()
  @ApiFindAllCountriesDocs()
  async findAll(@Query() query: FindAllDto): Promise<PaginatedResult<CountryResponseDto>> {
    const output = await this.countryService.findAll(query);

    return {
      data: output.data.map((country) => CountryMapper.toResponse(country)),
      meta: output.meta,
    };
  }

  @Get(':id')
  @ApiFindCountryByIdDocs()
  async findById(@Param() params: CountryIdDto): Promise<CountryResponseDto> {
    const output = await this.countryService.findById(params.id);
    return CountryMapper.toResponse(output);
  }

  @Patch(':id')
  @ApiUpdateCountryDocs()
  async update(
    @Param() params: CountryIdDto,
    @Body() body: UpdateCountryDto,
  ): Promise<CountryResponseDto> {
    const input = { name: body.name, code: body.code };
    const output = await this.countryService.update(params.id, input);
    return CountryMapper.toResponse(output);
  }

  @Delete(':id')
  @ApiDeleteCountryDocs()
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Param() params: CountryIdDto): Promise<void> {
    await this.countryService.delete(params.id);
  }
}
