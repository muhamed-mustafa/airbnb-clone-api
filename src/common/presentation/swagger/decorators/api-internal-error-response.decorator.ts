import { applyDecorators } from '@nestjs/common';
import { ApiInternalServerErrorResponse, ApiExtraModels, getSchemaPath } from '@nestjs/swagger';
import { InternalErrorResponseDto } from '../dtos/internal-error-response.dto';

export const ApiInternalErrorResponse = () =>
  applyDecorators(
    ApiExtraModels(InternalErrorResponseDto),
    ApiInternalServerErrorResponse({
      description: 'An unexpected server error occurred.',
      content: {
        'application/json': {
          schema: { $ref: getSchemaPath(InternalErrorResponseDto) },
          examples: {
            unexpected: {
              summary: 'Unexpected server error',
              value: { errors: [{ message: 'errors.internal_server_error' }] },
            },
          },
        },
      },
    }),
  );
