import { applyDecorators } from '@nestjs/common';
import {
  ApiExtension,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  getSchemaPath,
} from '@nestjs/swagger';

import { CurrencyResponseDto } from '@presentation/currencies/dtos/currency-response.dto';

import { ApiInternalErrorResponse } from '../api-internal-error-response.decorator';

import { ApiCurrencyValidationResponse } from './api-currency-responses.decorator';

export const ApiFindAllCurrenciesDocs = () =>
  applyDecorators(
    ApiExtension('x-docs-order', 20),

    ApiOperation({
      operationId: 'currenciesFindAll',
      summary: 'List currencies',
      description:
        'Returns a paginated list of non-deleted currencies. Name uses a literal, case-insensitive partial match; currencyCode uses an exact match.',
    }),

    ApiQuery({
      name: 'name',
      required: false,
      type: String,
      description: 'Partial currency name.',
      example: 'dollar',
    }),

    ApiQuery({
      name: 'currencyCode',
      required: false,
      type: String,
      description: 'Exact currency code.',
      example: 'USD',
    }),

    ApiQuery({
      name: 'page',
      required: false,
      schema: {
        type: 'integer',
        minimum: 1,
        default: 1,
      },
    }),

    ApiQuery({
      name: 'limit',
      required: false,
      schema: {
        type: 'integer',
        minimum: 1,
        maximum: 100,
        default: 10,
      },
    }),

    ApiOkResponse({
      description: 'Paginated list of matching currencies.',
      schema: {
        type: 'object',
        properties: {
          data: {
            type: 'array',
            items: {
              $ref: getSchemaPath(CurrencyResponseDto),
            },
          },
          meta: {
            type: 'object',
            properties: {
              page: {
                type: 'integer',
                example: 1,
              },
              limit: {
                type: 'integer',
                example: 10,
              },
              total: {
                type: 'integer',
                example: 25,
              },
              totalPages: {
                type: 'integer',
                example: 3,
              },
              hasNextPage: {
                type: 'boolean',
                example: true,
              },
              hasPreviousPage: {
                type: 'boolean',
                example: false,
              },
            },
          },
        },
      },
    }),

    ApiCurrencyValidationResponse(),
    ApiInternalErrorResponse(),
  );
