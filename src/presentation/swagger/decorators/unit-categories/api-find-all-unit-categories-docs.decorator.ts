import { applyDecorators } from '@nestjs/common';
import {
  ApiExtension,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  getSchemaPath,
} from '@nestjs/swagger';

import { UnitCategoryResponseDto } from '@presentation/unit-categories/dtos/unit-category-response.dto';

import { ApiInternalErrorResponse } from '../api-internal-error-response.decorator';

import { ApiUnitCategoryValidationResponse } from './api-unit-category-responses.decorator';

export const ApiFindAllUnitCategoriesDocs = () =>
  applyDecorators(
    ApiExtension('x-docs-order', 20),

    ApiOperation({
      operationId: 'unitCategoriesFindAll',
      summary: 'List unit categories',
      description:
        'Returns a paginated list of non-deleted unit categories. Name uses a literal, case-insensitive partial match.',
    }),

    ApiQuery({
      name: 'name',
      required: false,
      type: String,
      description: 'Partial unit category name.',
      example: 'weight',
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
      description: 'Paginated list of matching unit categories.',
      schema: {
        type: 'object',
        properties: {
          data: {
            type: 'array',
            items: {
              $ref: getSchemaPath(UnitCategoryResponseDto),
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

    ApiUnitCategoryValidationResponse(),
    ApiInternalErrorResponse(),
  );
