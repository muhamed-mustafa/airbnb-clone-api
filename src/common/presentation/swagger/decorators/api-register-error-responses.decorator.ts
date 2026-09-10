import { applyDecorators } from '@nestjs/common';
import { ApiBadRequestResponse, ApiExtraModels, getSchemaPath } from '@nestjs/swagger';
import { ApplicationErrorResponseDto } from '../dtos/application-error-response.dto';
import { ValidationErrorsResponseDto } from '../dtos/validation-errors-response.dto';

export const ApiRegisterBadRequestResponses = () =>
  applyDecorators(
    ApiExtraModels(ValidationErrorsResponseDto, ApplicationErrorResponseDto),
    ApiBadRequestResponse({
      description:
        'Bad request — returned for validation failures or an invalid phone number for the given country code.',
      schema: {
        oneOf: [
          { $ref: getSchemaPath(ValidationErrorsResponseDto) },
          { $ref: getSchemaPath(ApplicationErrorResponseDto) },
        ],
        examples: {
          validationError: {
            summary: 'Validation failure',
            value: {
              errors: [
                {
                  code: 'validation.isEmail',
                  field: 'email',
                  message: 'email must be a valid email address',
                },
              ],
            },
          },
          invalidPhone: {
            summary: 'Invalid phone number',
            value: {
              code: 'INVALID_PHONE_NUMBER',
              message: 'Invalid phone number',
            },
          },
        },
      },
    }),
  );
