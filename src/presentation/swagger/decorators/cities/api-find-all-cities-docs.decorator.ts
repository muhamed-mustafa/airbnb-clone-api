import { applyDecorators } from '@nestjs/common';
import {
  ApiExtension,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  getSchemaPath,
} from '@nestjs/swagger';
import { CityResponseDto } from '@presentation/cities/dtos/city-response.dto';
import { ApiInternalErrorResponse } from '../api-internal-error-response.decorator';
import { ApiCityValidationResponse } from './api-city-responses.decorator';

export const ApiFindAllCitiesDocs = () =>
  applyDecorators(
    ApiExtension('x-docs-order', 20),

    ApiOperation({
      operationId: 'citiesFindAll',
      summary: 'List cities',
      description:
        'Returns a paginated list of non-deleted cities sorted by name. Name uses a literal, case-insensitive partial match; country uses an exact match.',
    }),

    ApiQuery({
      name: 'name',
      required: false,
      type: String,
      description: 'Partial city name.',
      example: 'cai',
    }),

    ApiQuery({
      name: 'country',
      required: false,
      type: String,
      description: 'Exact country ID.',
      example: '670d1234567890abcdef1234',
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
      description: 'Paginated list of matching cities.',
      schema: {
        type: 'object',
        properties: {
          data: {
            type: 'array',
            items: {
              $ref: getSchemaPath(CityResponseDto),
            },
          },
          meta: {
            type: 'object',
            properties: {
              page: { type: 'integer', example: 1 },
              limit: { type: 'integer', example: 10 },
              total: { type: 'integer', example: 25 },
              totalPages: { type: 'integer', example: 3 },
              hasNextPage: { type: 'boolean', example: true },
              hasPreviousPage: { type: 'boolean', example: false },
            },
          },
        },
      },
    }),

    ApiCityValidationResponse(),
    ApiInternalErrorResponse(),
  );
