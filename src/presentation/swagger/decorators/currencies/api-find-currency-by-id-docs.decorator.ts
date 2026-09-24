import { applyDecorators } from '@nestjs/common';
import { ApiExtension, ApiOperation, ApiOkResponse } from '@nestjs/swagger';
import { CurrencyResponseDto } from '@presentation/currencies/dtos/currency-response.dto';

import { ApiInternalErrorResponse } from '../api-internal-error-response.decorator';
import {
  ApiCurrencyValidationResponse,
  ApiCurrencyIdParam,
  ApiCurrencyNotFoundResponse,
} from './api-currency-responses.decorator';

export const ApiFindCurrencyByIdDocs = () =>
  applyDecorators(
    ApiExtension('x-docs-order', 30),
    ApiOperation({
      operationId: 'currenciesFindById',
      summary: 'Get a currency',
      description: 'Returns a non-deleted currency by its ID.',
    }),
    ApiCurrencyIdParam(),
    ApiOkResponse({ description: 'Currency found.', type: CurrencyResponseDto }),
    ApiCurrencyNotFoundResponse(),
    ApiCurrencyValidationResponse(),
    ApiInternalErrorResponse(),
  );
