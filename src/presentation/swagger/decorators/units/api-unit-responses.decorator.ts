import { applyDecorators } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiExtraModels,
  ApiNotFoundResponse,
  ApiParam,
  getSchemaPath,
} from '@nestjs/swagger';
import { ValidationErrorsResponseDto } from '../../dtos/validation-errors-response.dto';

const applicationErrorSchema = {
  type: 'object' as const,
  required: ['code', 'message'],
  properties: { code: { type: 'string' as const }, message: { type: 'string' as const } },
};

export const ApiUnitValidationResponse = () =>
  applyDecorators(
    ApiExtraModels(ValidationErrorsResponseDto),
    ApiBadRequestResponse({
      description:
        'Request field types, bounds or ObjectId formats are invalid, unknown fields are present, the daily cost is below the configured minPrice, or the selected city does not belong to the selected country.',
      content: {
        'application/json': {
          schema: {
            oneOf: [
              { $ref: getSchemaPath(ValidationErrorsResponseDto) },
              {
                ...applicationErrorSchema,
                properties: {
                  ...applicationErrorSchema.properties,
                  code: {
                    type: 'string',
                    enum: ['UNIT_COST_PER_DAY_TOO_LOW_MIN_PRICE', 'CITY_COUNTRY_MISMATCH'],
                  },
                },
              },
            ],
          },
          examples: {
            invalidTitle: {
              summary: 'Title is too short',
              value: {
                errors: [
                  {
                    code: 'minLength',
                    field: 'title',
                    message: 'title must be longer than or equal to 5 characters',
                  },
                ],
              },
            },
            minimumPrice: {
              summary: 'Daily cost below configured minimum',
              value: {
                code: 'UNIT_COST_PER_DAY_TOO_LOW_MIN_PRICE',
                message: 'The cost per day is below the minimum allowed price of {{minPrice}}.',
              },
            },

            cityCountryMismatch: {
              summary: 'City does not belong to the selected country',
              value: {
                code: 'CITY_COUNTRY_MISMATCH',
                message: 'The selected city does not belong to the selected country.',
              },
            },
          },
        },
      },
    }),
  );
export const ApiUnitReferenceNotFoundResponse = () =>
  ApiNotFoundResponse({
    description: 'Country, city, accommodation type or application settings could not be found.',
    schema: {
      ...applicationErrorSchema,
      properties: {
        ...applicationErrorSchema.properties,
        code: {
          type: 'string',
          enum: [
            'COUNTRY_NOT_FOUND',
            'CITY_NOT_FOUND',
            'UNIT_CATEGORY_NOT_FOUND',
            'APP_SETTINGS_NOT_FOUND',
          ],
        },
      },
      example: { code: 'COUNTRY_NOT_FOUND', message: 'Country not found.' },
    },
  });
export const ApiUnitNotFoundResponse = (includeReferences = false) =>
  ApiNotFoundResponse({
    description: includeReferences
      ? 'The unit or a supplied country, city, accommodation type or required application settings does not exist.'
      : 'The unit does not exist.',
    schema: {
      ...applicationErrorSchema,
      properties: {
        ...applicationErrorSchema.properties,
        code: {
          type: 'string',
          enum: includeReferences
            ? [
                'UNIT_NOT_FOUND',
                'COUNTRY_NOT_FOUND',
                'CITY_NOT_FOUND',
                'UNIT_CATEGORY_NOT_FOUND',
                'APP_SETTINGS_NOT_FOUND',
              ]
            : ['UNIT_NOT_FOUND'],
        },
      },
      example: { code: 'UNIT_NOT_FOUND', message: 'The requested unit was not found.' },
    },
  });
export const ApiUnitIdParam = () =>
  ApiParam({
    name: 'id',
    required: true,
    description: 'Unit MongoDB ObjectId.',
    schema: { type: 'string', example: '670d1234567890abcdef1237', pattern: '^[a-fA-F0-9]{24}$' },
  });
