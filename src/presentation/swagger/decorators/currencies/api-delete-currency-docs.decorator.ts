import { applyDecorators } from '@nestjs/common';
import { ApiExtension, ApiOperation, ApiNoContentResponse } from '@nestjs/swagger';

import { ApiInternalErrorResponse } from '../api-internal-error-response.decorator';
import {
  ApiCurrencyValidationResponse,
  ApiCurrencyIdParam,
  ApiCurrencyNotFoundResponse,
} from './api-currency-responses.decorator';

export const ApiDeleteCurrencyDocs = () =>
  applyDecorators(
    ApiExtension('x-docs-order', 50),
    ApiOperation({
      operationId: 'currenciesDelete',
      summary: 'Delete a currency',
      description:
        'Soft deletes a currency by setting isDeleted and deletedAt. No documents are removed.',
    }),
    ApiCurrencyIdParam(),
    ApiNoContentResponse({
      description: 'Currency soft deleted successfully. No response body.',
    }),
    ApiCurrencyNotFoundResponse(),
    ApiCurrencyValidationResponse(),
    ApiInternalErrorResponse(),
  );
