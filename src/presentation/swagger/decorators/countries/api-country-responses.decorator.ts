import { applyDecorators } from '@nestjs/common';
import { ApiConflictResponse, ApiNotFoundResponse, ApiParam } from '@nestjs/swagger';
import { ApiValidationErrorResponse } from '../api-validation-error-response.decorator';

const applicationErrorSchema = {
  type: 'object' as const,
  required: ['code', 'message'],
  properties: { code: { type: 'string' as const }, message: { type: 'string' as const } },
};

export const ApiCountryNotFoundResponse = () =>
  ApiNotFoundResponse({
    description: 'The country does not exist or has been soft deleted.',
    schema: {
      ...applicationErrorSchema,
      example: { code: 'COUNTRY_NOT_FOUND', message: 'Country not found.' },
    },
  });

export const ApiCountryConflictResponse = () =>
  ApiConflictResponse({
    description: 'The country name or code is already in use.',
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
                      field: { type: 'string', enum: ['name', 'code'] },
                    },
                  },
                },
              },
            },
          ],
        },
        examples: {
          existingCountry: {
            summary: 'Duplicate detected before creation',
            value: { code: 'COUNTRY_ALREADY_EXISTS', message: 'Country already exists.' },
          },
          duplicateName: {
            summary: 'Database name conflict',
            value: {
              errors: [
                {
                  code: 'countries.COUNTRY_ALREADY_EXISTS',
                  field: 'name',
                  message: 'Country already exists.',
                },
              ],
            },
          },
          duplicateCode: {
            summary: 'Database code conflict',
            value: {
              errors: [
                {
                  code: 'countries.COUNTRY_ALREADY_EXISTS',
                  field: 'code',
                  message: 'Country already exists.',
                },
              ],
            },
          },
        },
      },
    },
  });

export const ApiCountryIdParam = () =>
  ApiParam({
    name: 'id',
    required: true,
    description: 'Country MongoDB ObjectId.',
    schema: { type: 'string', pattern: '^[a-fA-F0-9]{24}$', example: '670d1234567890abcdef1234' },
  });

export const ApiCountryValidationResponse = () =>
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
