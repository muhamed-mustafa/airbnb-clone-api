import { applyDecorators } from '@nestjs/common';
import { ApiConflictResponse, ApiNotFoundResponse, ApiParam } from '@nestjs/swagger';
import { ApiValidationErrorResponse } from '../api-validation-error-response.decorator';

const applicationErrorSchema = {
  type: 'object' as const,
  required: ['code', 'message'],
  properties: { code: { type: 'string' as const }, message: { type: 'string' as const } },
};

export const ApiCurrencyNotFoundResponse = () =>
  ApiNotFoundResponse({
    description: 'The currency does not exist or has been soft deleted.',
    schema: {
      ...applicationErrorSchema,
      example: { code: 'CURRENCY_NOT_FOUND', message: 'Currency not found.' },
    },
  });

export const ApiCurrencyConflictResponse = () =>
  ApiConflictResponse({
    description: 'The currency name or code is already in use.',
    content: {
      'application/json': {
        schema: {
          oneOf: [
            applicationErrorSchema,
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
                      field: { type: 'string', enum: ['name', 'currencyCode'] },
                    },
                  },
                },
              },
            },
          ],
        },
        examples: {
          existingCurrency: {
            summary: 'Duplicate detected before creation',
            value: { code: 'CURRENCY_ALREADY_EXISTS', message: 'Currency already exists.' },
          },
          duplicateName: {
            summary: 'Database name conflict',
            value: {
              errors: [
                {
                  code: 'currencies.CURRENCY_ALREADY_EXISTS',
                  field: 'name',
                  message: 'Currency already exists.',
                },
              ],
            },
          },
          duplicateCode: {
            summary: 'Database code conflict',
            value: {
              errors: [
                {
                  code: 'currencies.CURRENCY_ALREADY_EXISTS',
                  field: 'currencyCode',
                  message: 'Currency already exists.',
                },
              ],
            },
          },
        },
      },
    },
  });

export const ApiCurrencyIdParam = () =>
  ApiParam({
    name: 'id',
    required: true,
    description: 'Currency MongoDB ObjectId.',
    schema: { type: 'string', pattern: '^[a-fA-F0-9]{24}$', example: '670d1234567890abcdef1234' },
  });

export const ApiCurrencyValidationResponse = () =>
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
