import { applyDecorators } from '@nestjs/common';
import { ApiNotFoundResponse, ApiParam } from '@nestjs/swagger';
import { ApiValidationErrorResponse } from '../api-validation-error-response.decorator';
import { errorsResponseSchema } from '../../error-response.schema';

export const ApiAdminNotFoundResponse = () =>
  ApiNotFoundResponse({
    description: 'The admin does not exist or has been soft deleted.',
    schema: {
      ...errorsResponseSchema(),
      example: { errors: [{ code: 'ADMIN_NOT_FOUND', message: 'Admin not found.' }] },
    },
  });

export const ApiAdminIdParam = () =>
  ApiParam({
    name: 'id',
    required: true,
    description: 'Admin MongoDB ObjectId.',
    schema: { type: 'string', pattern: '^[a-fA-F0-9]{24}$', example: '670d1234567890abcdef1234' },
  });

export const ApiAdminValidationResponse = () =>
  applyDecorators(
    ApiValidationErrorResponse({
      unknownField: {
        summary: 'Unknown request field',
        value: {
          errors: [
            {
              code: 'whitelistValidation',
              field: 'extra',
              message: 'property extra should not exist',
            },
          ],
        },
      },
    }),
  );
