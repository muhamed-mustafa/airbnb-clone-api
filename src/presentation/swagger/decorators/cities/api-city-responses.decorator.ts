import { applyDecorators } from '@nestjs/common';
import { ApiConflictResponse, ApiNotFoundResponse, ApiParam } from '@nestjs/swagger';
import { ApiValidationErrorResponse } from '../api-validation-error-response.decorator';

const applicationErrorSchema = {
  type: 'object' as const,
  required: ['code', 'message'],
  properties: { code: { type: 'string' as const }, message: { type: 'string' as const } },
};

const notFoundExamples = {
  city: {
    summary: 'City not found',
    value: { code: 'CITY_NOT_FOUND', message: 'City not found.' },
  },
  country: {
    summary: 'Referenced country not found',
    value: { code: 'COUNTRY_NOT_FOUND', message: 'Country not found.' },
  },
};

const notFoundResponse = (description: string, examples: Partial<typeof notFoundExamples>) =>
  ApiNotFoundResponse({
    description,
    content: { 'application/json': { schema: applicationErrorSchema, examples } },
  });

export const ApiCityNotFoundResponse = () =>
  notFoundResponse('The city does not exist or has been soft deleted.', {
    city: notFoundExamples.city,
  });

export const ApiCityCountryNotFoundResponse = () =>
  notFoundResponse('The referenced country does not exist or has been soft deleted.', {
    country: notFoundExamples.country,
  });

export const ApiCityOrCountryNotFoundResponse = () =>
  notFoundResponse(
    'The city, or the referenced country, does not exist or has been soft deleted.',
    notFoundExamples,
  );

export const ApiCityConflictResponse = () =>
  ApiConflictResponse({
    description: 'A city with this name already exists in the same country.',
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
                      field: { type: 'string', enum: ['name'] },
                    },
                  },
                },
              },
            },
          ],
        },
        examples: {
          existingCity: {
            summary: 'Duplicate detected before creation',
            value: {
              code: 'CITY_ALREADY_EXISTS',
              message: 'A city with this name already exists in this country.',
            },
          },
          duplicateCity: {
            summary: 'Database { country, name } conflict',
            value: {
              errors: [
                {
                  code: 'cities.CITY_ALREADY_EXISTS',
                  field: 'name',
                  message: 'A city with this name already exists in this country.',
                },
              ],
            },
          },
        },
      },
    },
  });

export const ApiCityIdParam = () =>
  ApiParam({
    name: 'id',
    required: true,
    description: 'City MongoDB ObjectId.',
    schema: { type: 'string', pattern: '^[a-fA-F0-9]{24}$', example: '670d1234567890abcdef5678' },
  });

export const ApiCityValidationResponse = () =>
  applyDecorators(
    ApiValidationErrorResponse({
      invalidMongoId: {
        summary: 'Invalid ObjectId',
        value: {
          errors: [
            {
              code: 'isMongoId',
              field: 'country',
              message: 'Please provide a valid Mongo ID',
            },
          ],
        },
      },
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
