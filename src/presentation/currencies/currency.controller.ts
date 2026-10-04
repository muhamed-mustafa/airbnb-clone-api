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
import { Roles } from '../../common/constants/roles.constant';
import { PaginatedResult } from '../../common/pagination/pagination.types';
import { IsPublic } from '../auth/decorators/is-public.decorator';
import { AllowedRoles } from '../auth/decorators/roles.decorator';
import { ApiCreateCurrencyDocs } from '../swagger/decorators/currencies/api-create-currency-docs.decorator';
import { ApiDeleteCurrencyDocs } from '../swagger/decorators/currencies/api-delete-currency-docs.decorator';
import { ApiFindAllCurrenciesDocs } from '../swagger/decorators/currencies/api-find-all-currencies-docs.decorator';
import { ApiFindCurrencyByIdDocs } from '../swagger/decorators/currencies/api-find-currency-by-id-docs.decorator';
import { ApiUpdateCurrencyDocs } from '../swagger/decorators/currencies/api-update-currency-docs.decorator';
import { SWAGGER_TAGS } from '../swagger/swagger.constants';
import { CreateCurrencyDto } from './dtos/create-currency.dto';
import { CurrencyIdDto } from './dtos/currency-id.dto';
import { CurrencyResponseDto } from './dtos/currency-response.dto';
import { FindAllDto } from './dtos/find-all.dto';
import { UpdateCurrencyDto } from './dtos/update-currency.dto';
import { CurrencyMapper } from './mappers/currency.mapper';

@ApiTags(SWAGGER_TAGS.CURRENCIES)
@Controller('currencies')
export class CurrencyController {
  constructor(private readonly currencyService: CurrencyService) {}

  @Post()
  @AllowedRoles(Roles.ADMIN)
  @ApiCreateCurrencyDocs()
  async create(@Body() body: CreateCurrencyDto): Promise<CurrencyResponseDto> {
    const input = CurrencyMapper.toCurrencyInput(body);
    const output = await this.currencyService.create(input);
    return CurrencyMapper.toResponse(output);
  }

  @Get()
  @ApiFindAllCurrenciesDocs()
  @IsPublic()
  async findAll(@Query() query: FindAllDto): Promise<PaginatedResult<CurrencyResponseDto>> {
    const output = await this.currencyService.findAll(query);

    return {
      data: output.data.map((currency) => CurrencyMapper.toResponse(currency)),
      meta: output.meta,
    };
  }

  @Get(':id')
  @IsPublic()
  @ApiFindCurrencyByIdDocs()
  async findById(@Param() params: CurrencyIdDto): Promise<CurrencyResponseDto> {
    const output = await this.currencyService.findById(params.id);
    return CurrencyMapper.toResponse(output);
  }

  @Patch(':id')
  @AllowedRoles(Roles.ADMIN)
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
  @AllowedRoles(Roles.ADMIN)
  @ApiDeleteCurrencyDocs()
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Param() params: CurrencyIdDto): Promise<void> {
    await this.currencyService.delete(params.id);
  }
}
