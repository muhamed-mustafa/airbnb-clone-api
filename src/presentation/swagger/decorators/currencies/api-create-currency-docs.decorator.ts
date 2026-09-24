import { applyDecorators } from '@nestjs/common';
import { ApiExtension, ApiOperation, ApiBody, ApiCreatedResponse } from '@nestjs/swagger';
import { CurrencyResponseDto } from '@presentation/currencies/dtos/currency-response.dto';
import { CreateCurrencyDto } from '@presentation/currencies/dtos/create-currency.dto';
import { ApiInternalErrorResponse } from '../api-internal-error-response.decorator';
import {
  ApiCurrencyValidationResponse,
  ApiCurrencyConflictResponse,
} from './api-currency-responses.decorator';

export const ApiCreateCurrencyDocs = () =>
  applyDecorators(
    ApiExtension('x-docs-order', 10),
    ApiOperation({
      operationId: 'currenciesCreate',
      summary: 'Create a currency',
      description: 'Creates a currency with a unique name and code.',
    }),
    ApiBody({ type: CreateCurrencyDto }),
    ApiCreatedResponse({
      description: 'Currency created successfully.',
      type: CurrencyResponseDto,
    }),
    ApiCurrencyConflictResponse(),
    ApiCurrencyValidationResponse(),
    ApiInternalErrorResponse(),
  );
