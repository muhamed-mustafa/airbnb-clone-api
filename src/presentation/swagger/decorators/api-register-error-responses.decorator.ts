import { REGISTER_VALIDATION_EXAMPLES } from '../examples/validation.examples';
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
      content: {
        'application/json': {
          schema: {
            oneOf: [
              { $ref: getSchemaPath(ValidationErrorsResponseDto) },
              { $ref: getSchemaPath(ApplicationErrorResponseDto) },
            ],
          },
          examples: {
            ...REGISTER_VALIDATION_EXAMPLES,
            invalidPhone: {
              summary: 'phone ? invalid for country code',
              value: { code: 'INVALID_PHONE_NUMBER', message: 'Invalid phone number' },
            },
          },
        },
      },
    }),
  );
