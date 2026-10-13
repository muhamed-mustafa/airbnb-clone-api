import { applyDecorators } from '@nestjs/common';
import {
  ApiExtension,
  ApiExtraModels,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  getSchemaPath,
} from '@nestjs/swagger';
import { UnitResponseDto } from '@presentation/units/dtos/unit-response.dto';
import { ApiInternalErrorResponse } from '../api-internal-error-response.decorator';
import { ApiValidationErrorResponse } from '../api-validation-error-response.decorator';

export const ApiFindAllUnitsDocs = () =>
  applyDecorators(
    ApiExtension('x-docs-order', 15),
    ApiOperation({
      operationId: 'unitsFindAll',
      summary: 'List accommodation listings',
      description:
        'Public paginated list of active, non-deleted units. Title searches title and description as literal case-insensitive substrings. Price bounds are inclusive; capacity and facility filters use exact matches. Sorted by daily cost ascending, then MongoDB ObjectId. Inactive units are excluded; availability is not implicitly filtered.',
    }),
    ApiQuery({
      name: 'page',
      required: false,
      schema: { type: 'integer', minimum: 1, default: 1 },
    }),
    ApiQuery({
      name: 'limit',
      required: false,
      schema: { type: 'integer', minimum: 1, maximum: 100, default: 10 },
    }),
    ApiExtraModels(UnitResponseDto),
    ApiOkResponse({
      description: 'Paginated matching units.',
      schema: {
        type: 'object',
        required: ['data', 'meta'],
        properties: {
          data: { type: 'array', items: { $ref: getSchemaPath(UnitResponseDto) } },
          meta: {
            type: 'object',
            required: ['page', 'limit', 'total', 'totalPages', 'hasNextPage', 'hasPreviousPage'],
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
    ApiValidationErrorResponse({
      invalidRange: {
        summary: 'Minimum price exceeds maximum price',
        value: {
          errors: [
            {
              code: 'isValidPriceRange',
              field: 'maxPrice',
              message: 'Minimum price must be less than or equal to maximum price.',
            },
          ],
        },
      },
      invalidPrice: {
        summary: 'Invalid minimum price',
        value: {
          errors: [{ code: 'min', field: 'minPrice', message: 'minPrice must not be less than 1' }],
        },
      },
    }),
    ApiInternalErrorResponse(),
  );
