import { applyDecorators } from '@nestjs/common';
import { ApiConflictResponse, ApiNotFoundResponse, ApiParam } from '@nestjs/swagger';
import { ApiValidationErrorResponse } from '../api-validation-error-response.decorator';
import { errorsResponseSchema } from '../../error-response.schema';

export const ApiUnitCategoryNotFoundResponse = () =>
  ApiNotFoundResponse({
    description: 'The unit category does not exist or has been soft deleted.',
    schema: {
      ...errorsResponseSchema(),
      example: {
        errors: [{ code: 'UNIT_CATEGORY_NOT_FOUND', message: 'Unit category not found.' }],
      },
    },
  });

export const ApiUnitCategoryConflictResponse = () =>
  ApiConflictResponse({
    description: 'The unit category name is already in use.',
    content: {
      'application/json': {
        schema: {
          anyOf: [
            errorsResponseSchema(),
            {
              type: 'object',
              required: ['errors'],
              properties: {
                errors: {
                  type: 'array',
                  items: {
                    type: 'object',
                    required: ['code', 'message'],
                    properties: {
                      code: { type: 'string' },
                      message: { type: 'string' },
                      field: { type: 'string', enum: ['name'] },
                    },
                  },
                },
              },
            },
          ],
        },
        examples: {
          existingUnitCategory: {
            summary: 'Duplicate detected before creation',
            value: {
              errors: [
                {
                  code: 'UNIT_CATEGORY_ALREADY_EXISTS',
                  message: 'A unit category with this name already exists.',
                },
              ],
            },
          },
          duplicateName: {
            summary: 'Database name conflict',
            value: {
              errors: [
                {
                  code: 'unit-categories.UNIT_CATEGORY_ALREADY_EXISTS',
                  field: 'name',
                  message: 'A unit category with this name already exists.',
                },
              ],
            },
          },
        },
      },
    },
  });

export const ApiUnitCategoryIdParam = () =>
  ApiParam({
    name: 'id',
    required: true,
    description: 'Unit category MongoDB ObjectId.',
    schema: { type: 'string', pattern: '^[a-fA-F0-9]{24}$', example: '670d1234567890abcdef1234' },
  });

export const ApiUnitCategoryValidationResponse = () =>
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
