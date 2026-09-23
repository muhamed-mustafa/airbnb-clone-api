import { applyDecorators } from '@nestjs/common';
import {
  ApiExtension,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  getSchemaPath,
} from '@nestjs/swagger';

import { CountryResponseDto } from '@presentation/countries/dtos/country-response.dto';

import { ApiInternalErrorResponse } from '../api-internal-error-response.decorator';

import { ApiCountryValidationResponse } from './api-country-responses.decorator';

export const ApiFindAllCountriesDocs = () =>
  applyDecorators(
    ApiExtension('x-docs-order', 20),

    ApiOperation({
      operationId: 'countriesFindAll',
      summary: 'List countries',
      description:
        'Returns a paginated list of non-deleted countries. Name uses a literal, case-insensitive partial match; code uses an exact match.',
    }),

    ApiQuery({
      name: 'name',
      required: false,
      type: String,
      description: 'Partial country name.',
      example: 'egy',
    }),

    ApiQuery({
      name: 'code',
      required: false,
      type: String,
      description: 'Exact country code.',
      example: 'EG',
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
      description: 'Paginated list of matching countries.',
      schema: {
        type: 'object',
        properties: {
          data: {
            type: 'array',
            items: {
              $ref: getSchemaPath(CountryResponseDto),
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

    ApiCountryValidationResponse(),
    ApiInternalErrorResponse(),
  );
