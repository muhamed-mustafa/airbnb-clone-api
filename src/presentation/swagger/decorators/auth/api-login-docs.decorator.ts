import { LOGIN_VALIDATION_EXAMPLES } from '../../examples/validation.examples';
import { applyDecorators } from '@nestjs/common';
import { ApiBody, ApiCreatedResponse, ApiExtension, ApiOperation } from '@nestjs/swagger';
import { AuthResponseDto } from '../../../auth/dtos/auth-response.dto';
import { LoginDto } from '../../../auth/dtos/login.dto';
import { ApiInternalErrorResponse } from '../api-internal-error-response.decorator';
import { ApiValidationErrorResponse } from '../api-validation-error-response.decorator';
import { ApiInvalidCredentialsResponse } from '../api-application-error-responses.decorator';

export const ApiLoginDocs = () =>
  applyDecorators(
    ApiExtension('x-docs-order', 20),
    ApiOperation({
      operationId: 'authLogin',
      summary: 'Login user',
      description:
        'Validates user credentials and returns JWT access and refresh tokens for authenticated API access.',
    }),
    ApiBody({ type: LoginDto }),
    ApiCreatedResponse({
      description: 'Authentication successful. Returns access and refresh tokens.',
      type: AuthResponseDto,
    }),
    ApiValidationErrorResponse(LOGIN_VALIDATION_EXAMPLES),
    ApiInvalidCredentialsResponse(),
    ApiInternalErrorResponse(),
  );
