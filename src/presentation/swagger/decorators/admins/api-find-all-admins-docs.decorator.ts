import { applyDecorators } from '@nestjs/common';
import {
  ApiExtension,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  getSchemaPath,
} from '@nestjs/swagger';
import { AdminResponseDto } from '@presentation/admin/dtos/admin-response.dto';
import { ApiInternalErrorResponse } from '../api-internal-error-response.decorator';
import { ApiValidationErrorResponse } from '../api-validation-error-response.decorator';

export const ApiFindAllAdminsDocs = () =>
  applyDecorators(
    ApiExtension('x-docs-order', 20),

    ApiOperation({
      operationId: 'adminsFindAll',
      summary: 'List admins',
      description:
        'Returns a paginated list of admins. Supports optional filtering by name, email, and super admin status.',
    }),

    ApiQuery({
      name: 'name',
      required: false,
      type: String,
      description: 'Partial admin name.',
      example: 'John',
    }),

    ApiQuery({
      name: 'email',
      required: false,
      type: String,
      description: 'Admin email address.',
      example: 'muhammedmostafa.dev@gmail.com',
    }),

    ApiQuery({
      name: 'isSuperAdmin',
      required: false,
      type: Boolean,
      description: 'Filter by super admin status.',
      example: true,
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
      description: 'Paginated list of matching admins.',
      schema: {
        type: 'object',
        properties: {
          data: {
            type: 'array',
            items: {
              $ref: getSchemaPath(AdminResponseDto),
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
    ApiInternalErrorResponse(),
  );
