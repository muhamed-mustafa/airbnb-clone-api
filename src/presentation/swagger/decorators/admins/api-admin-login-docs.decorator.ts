import { applyDecorators } from '@nestjs/common';
import { ApiBody, ApiCreatedResponse, ApiExtension, ApiOperation } from '@nestjs/swagger';
import { LoginAdminDto } from '@presentation/admin/dtos/login-admin.dto';
import { AuthResponseDto } from '@presentation/auth/dtos/auth-response.dto';
import { LOGIN_VALIDATION_EXAMPLES } from '@presentation/swagger/examples/validation.examples';
import { ApiInvalidCredentialsResponse } from '../api-application-error-responses.decorator';
import { ApiInternalErrorResponse } from '../api-internal-error-response.decorator';
import { ApiValidationErrorResponse } from '../api-validation-error-response.decorator';

export const ApiAdminLoginDocs = () =>
  applyDecorators(
    ApiExtension('x-docs-order', 10),
    ApiOperation({
      operationId: 'adminLogin',
      summary: 'Login admin',
      description:
        'Validates admin credentials and returns JWT access and refresh tokens for authenticated admin API access.',
    }),
    ApiBody({ type: LoginAdminDto }),
    ApiCreatedResponse({
      description: 'Authentication successful. Returns access and refresh tokens.',
      type: AuthResponseDto,
    }),
    ApiValidationErrorResponse(LOGIN_VALIDATION_EXAMPLES),
    ApiInvalidCredentialsResponse(),
    ApiInternalErrorResponse(),
  );
