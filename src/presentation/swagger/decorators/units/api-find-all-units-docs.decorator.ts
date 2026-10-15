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
    ApiQuery({
      name: 'title',
      required: false,
      description: 'Literal case-insensitive partial match in title or description; trimmed.',
      schema: { type: 'string', minLength: 3, maxLength: 50, example: 'apartment' },
    }),
    ApiQuery({
      name: 'unitCategory',
      required: false,
      description: 'Exact accommodation type ObjectId.',
      schema: { type: 'string', pattern: '^[a-fA-F0-9]{24}$', example: '670d1234567890abcdef1236' },
    }),
    ApiQuery({
      name: 'country',
      required: false,
      description: 'Exact country ObjectId.',
      schema: { type: 'string', pattern: '^[a-fA-F0-9]{24}$', example: '670d1234567890abcdef1234' },
    }),
    ApiQuery({
      name: 'city',
      required: false,
      description: 'Exact city ObjectId.',
      schema: { type: 'string', pattern: '^[a-fA-F0-9]{24}$', example: '670d1234567890abcdef1235' },
    }),
    ApiQuery({
      name: 'minPrice',
      required: false,
      description: 'Inclusive minimum daily cost.',
      schema: { type: 'number', minimum: 1, example: 100 },
    }),
    ApiQuery({
      name: 'maxPrice',
      required: false,
      description:
        'Inclusive maximum daily cost. When both bounds are provided, maxPrice must be greater than or equal to minPrice; an invalid range is rejected with HTTP 400.',
      schema: { type: 'number', minimum: 1, example: 2000 },
    }),
    ApiQuery({
      name: 'roomsCount',
      required: false,
      description: 'Exact number of rooms.',
      schema: { type: 'integer', minimum: 1, example: 2 },
    }),
    ApiQuery({
      name: 'availability',
      required: false,
      description: 'Exact accommodation availability; true or false.',
      schema: { type: 'boolean', example: true },
    }),
    ApiQuery({
      name: 'adultsCount',
      required: false,
      description: 'Exact adult capacity (not a minimum).',
      schema: { type: 'integer', minimum: 1, example: 2 },
    }),
    ApiQuery({
      name: 'kidsCount',
      required: false,
      description: 'Exact child capacity (not a minimum).',
      schema: { type: 'integer', minimum: 0, example: 0 },
    }),
    ApiQuery({
      name: 'hasInternetService',
      required: false,
      description: 'Exact internet availability; true or false.',
      schema: { type: 'boolean', example: false },
    }),
    ApiQuery({
      name: 'hasKitchen',
      required: false,
      description: 'Exact kitchen availability; true or false.',
      schema: { type: 'boolean', example: true },
    }),
    ApiQuery({
      name: 'hasPrivateGarage',
      required: false,
      description: 'Exact private garage availability; true or false.',
      schema: { type: 'boolean', example: false },
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
