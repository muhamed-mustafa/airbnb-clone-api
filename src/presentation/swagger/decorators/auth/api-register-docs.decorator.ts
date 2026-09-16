import { applyDecorators } from '@nestjs/common';
import { ApiBody, ApiCreatedResponse, ApiExtension, ApiOperation } from '@nestjs/swagger';
import { AuthResponseDto } from '@presentation/auth/dtos/auth-response.dto';
import { RegisterDto } from '@presentation/auth/dtos/register.dto';
import { ApiRegisterBadRequestResponses } from '../api-register-error-responses.decorator';
import { ApiConflictErrorResponse } from '../api-conflict-error-response.decorator';
import { ApiInternalErrorResponse } from '../api-internal-error-response.decorator';

export const ApiRegisterDocs = () =>
  applyDecorators(
    ApiExtension('x-docs-order', 10),
    ApiOperation({
      operationId: 'authRegister',
      summary: 'Register a new user',
      description:
        'Creates a new user account with the provided profile details and returns JWT access and refresh tokens.',
    }),
    ApiBody({ type: RegisterDto }),
    ApiCreatedResponse({
      description: 'Account created successfully. Returns access and refresh tokens.',
      type: AuthResponseDto,
    }),
    ApiRegisterBadRequestResponses(),
    ApiConflictErrorResponse(),
    ApiInternalErrorResponse(),
  );
