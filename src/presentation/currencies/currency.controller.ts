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
import { CurrencyService } from '../../application/currencies/services/currency.service';
import { PaginatedResult } from '../../common/pagination/pagination.types';
import { ApiCreateCurrencyDocs } from '../swagger/decorators/currencies/api-create-currency-docs.decorator';
import { ApiDeleteCurrencyDocs } from '../swagger/decorators/currencies/api-delete-currency-docs.decorator';
import { ApiFindAllCurrenciesDocs } from '../swagger/decorators/currencies/api-find-all-currencies-docs.decorator';
import { ApiFindCurrencyByIdDocs } from '../swagger/decorators/currencies/api-find-currency-by-id-docs.decorator';
import { ApiUpdateCurrencyDocs } from '../swagger/decorators/currencies/api-update-currency-docs.decorator';
import { SWAGGER_TAGS } from '../swagger/swagger.constants';
import { CurrencyIdDto } from './dtos/currency-id.dto';
import { CurrencyResponseDto } from './dtos/currency-response.dto';
import { CreateCurrencyDto } from './dtos/create-currency.dto';
import { FindAllDto } from './dtos/find-all.dto';
import { UpdateCurrencyDto } from './dtos/update-currency.dto';
import { CurrencyMapper } from './mappers/currency.mapper';

@ApiTags(SWAGGER_TAGS.CURRENCIES)
@Controller('currencies')
export class CurrencyController {
  constructor(private readonly currencyService: CurrencyService) {}

  @Post()
  @ApiCreateCurrencyDocs()
  async create(@Body() body: CreateCurrencyDto): Promise<CurrencyResponseDto> {
    const input = CurrencyMapper.toCurrencyInput(body);
    const output = await this.currencyService.create(input);
    return CurrencyMapper.toResponse(output);
  }

  @Get()
  @ApiFindAllCurrenciesDocs()
  async findAll(@Query() query: FindAllDto): Promise<PaginatedResult<CurrencyResponseDto>> {
    const output = await this.currencyService.findAll(query);

    return {
      data: output.data.map((currency) => CurrencyMapper.toResponse(currency)),
      meta: output.meta,
    };
  }

  @Get(':id')
  @ApiFindCurrencyByIdDocs()
  async findById(@Param() params: CurrencyIdDto): Promise<CurrencyResponseDto> {
    const output = await this.currencyService.findById(params.id);
    return CurrencyMapper.toResponse(output);
  }

  @Patch(':id')
  @ApiUpdateCurrencyDocs()
  async update(
    @Param() params: CurrencyIdDto,
    @Body() body: UpdateCurrencyDto,
  ): Promise<CurrencyResponseDto> {
    const input = { name: body.name, currencyCode: body.currencyCode };
    const output = await this.currencyService.update(params.id, input);
    return CurrencyMapper.toResponse(output);
  }

  @Delete(':id')
  @ApiDeleteCurrencyDocs()
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Param() params: CurrencyIdDto): Promise<void> {
    await this.currencyService.delete(params.id);
  }
}
