import { applyDecorators } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiUnauthorizedResponse,
  ApiExtraModels,
  getSchemaPath,
} from '@nestjs/swagger';
import { ApplicationErrorResponseDto } from '../dtos/application-error-response.dto';

export const ApiInvalidCredentialsResponse = () =>
  applyDecorators(
    ApiExtraModels(ApplicationErrorResponseDto),
    ApiUnauthorizedResponse({
      description: 'Authentication failed due to invalid email or password.',
      content: {
        'application/json': {
          schema: { $ref: getSchemaPath(ApplicationErrorResponseDto) },
          examples: {
            email: {
              summary: 'Incorrect email',
              value: { code: 'INVALID_CREDENTIALS', message: 'Invalid credentials' },
            },
            password: {
              summary: 'Incorrect password',
              value: { code: 'INVALID_CREDENTIALS', message: 'Invalid credentials' },
            },
          },
        },
      },
    }),
  );

export const ApiInvalidTokenResponse = () =>
  applyDecorators(
    ApiExtraModels(ApplicationErrorResponseDto),
    ApiUnauthorizedResponse({
      description: 'The provided refresh token is invalid or expired.',
      content: {
        'application/json': {
          schema: { $ref: getSchemaPath(ApplicationErrorResponseDto) },
          examples: {
            invalid: {
              summary: 'Invalid token',
              value: { code: 'INVALID_TOKEN', message: 'Invalid token' },
            },
            expired: {
              summary: 'Expired token',
              value: { code: 'INVALID_TOKEN', message: 'Invalid token' },
            },
          },
        },
      },
    }),
  );

export const ApiInvalidPhoneNumberResponse = () =>
  applyDecorators(
    ApiExtraModels(ApplicationErrorResponseDto),
    ApiBadRequestResponse({
      description: 'The provided phone number is invalid for the given country code.',
      content: {
        'application/json': {
          schema: { $ref: getSchemaPath(ApplicationErrorResponseDto) },
          examples: {
            invalidPhone: {
              summary: 'Invalid phone number',
              value: { code: 'INVALID_PHONE_NUMBER', message: 'Invalid phone number' },
            },
          },
        },
      },
    }),
  );
