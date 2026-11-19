import { applyDecorators } from '@nestjs/common';
import { ApiBody, ApiCreatedResponse, ApiExtension, ApiOperation } from '@nestjs/swagger';
import { RegistrationPendingDto } from '@presentation/auth/dtos/registration-pending.dto';
import { RegisterDto } from '@presentation/auth/dtos/register.dto';
import { ApiRegisterBadRequestResponses } from '../api-register-error-responses.decorator';
import { ApiConflictErrorResponse } from '../api-conflict-error-response.decorator';
import { ApiInternalErrorResponse } from '../api-internal-error-response.decorator';

export const ApiRegisterDocs = () =>
  applyDecorators(
    ApiExtension('x-docs-audience', 'user'),
    ApiExtension('x-docs-order', 10),
    ApiOperation({
      operationId: 'authRegister',
      summary: 'Register a new user',
      description:
        'Creates a pending user account and emails a one-time activation code. Legacy accounts remain active. Tokens are issued only after email activation.',
    }),
    ApiBody({ type: RegisterDto }),
    ApiCreatedResponse({
      description: 'Account created. Verify the emailed activation code before signing in.',
      type: RegistrationPendingDto,
    }),
    ApiRegisterBadRequestResponses(),
    ApiConflictErrorResponse(),
    ApiInternalErrorResponse(),
  );
