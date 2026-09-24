import { applyDecorators } from '@nestjs/common';
import { ApiExtension, ApiOperation, ApiBody, ApiOkResponse } from '@nestjs/swagger';
import { CurrencyResponseDto } from '@presentation/currencies/dtos/currency-response.dto';
import { UpdateCurrencyDto } from '@presentation/currencies/dtos/update-currency.dto';
import { ApiInternalErrorResponse } from '../api-internal-error-response.decorator';
import {
  ApiCurrencyValidationResponse,
  ApiCurrencyIdParam,
  ApiCurrencyNotFoundResponse,
  ApiCurrencyConflictResponse,
} from './api-currency-responses.decorator';

export const ApiUpdateCurrencyDocs = () =>
  applyDecorators(
    ApiExtension('x-docs-order', 40),
    ApiOperation({
      operationId: 'currenciesUpdate',
      summary: 'Update a currency',
      description: 'Updates only the supplied name or code of a non-deleted currency.',
    }),
    ApiCurrencyIdParam(),
    ApiBody({ type: UpdateCurrencyDto }),
    ApiOkResponse({ description: 'Currency after the update.', type: CurrencyResponseDto }),
    ApiCurrencyNotFoundResponse(),
    ApiCurrencyConflictResponse(),
    ApiCurrencyValidationResponse(),
    ApiInternalErrorResponse(),
  );
