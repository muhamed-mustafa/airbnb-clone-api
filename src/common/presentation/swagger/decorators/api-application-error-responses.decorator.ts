import { applyDecorators } from '@nestjs/common';
import { ApiBadRequestResponse, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { ApplicationErrorResponseDto } from '../dtos/application-error-response.dto';

export const ApiInvalidCredentialsResponse = () =>
  applyDecorators(
    ApiUnauthorizedResponse({
      description: 'Authentication failed due to invalid email or password.',
      type: ApplicationErrorResponseDto,
    }),
  );

export const ApiInvalidTokenResponse = () =>
  applyDecorators(
    ApiUnauthorizedResponse({
      description: 'The provided refresh token is invalid or expired.',
      type: ApplicationErrorResponseDto,
    }),
  );

export const ApiInvalidPhoneNumberResponse = () =>
  applyDecorators(
    ApiBadRequestResponse({
      description: 'The provided phone number is invalid for the given country code.',
      type: ApplicationErrorResponseDto,
    }),
  );
