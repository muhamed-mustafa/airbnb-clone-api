import { applyDecorators } from '@nestjs/common';
import { ApiExtraModels, ApiOkResponse, ApiOperation, getSchemaPath } from '@nestjs/swagger';
import { BookingListResponseDto } from '@presentation/bookings/dtos/booking-list-response.dto';
import { ApiInternalErrorResponse } from './api-internal-error-response.decorator';
import { ApiValidationErrorResponse } from './api-validation-error-response.decorator';

export function ApiFindBookingsDocs(operationId: string, summary: string, description: string) {
  return applyDecorators(
    ApiOperation({ operationId, summary, description }),
    ApiExtraModels(BookingListResponseDto),
    ApiOkResponse({
      description: 'Paginated bookings matching the supplied filters.',
      schema: {
        type: 'object',
        required: ['data', 'meta'],
        properties: {
          data: { type: 'array', items: { $ref: getSchemaPath(BookingListResponseDto) } },
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
    ApiValidationErrorResponse({}),
    ApiInternalErrorResponse(),
  );
}
