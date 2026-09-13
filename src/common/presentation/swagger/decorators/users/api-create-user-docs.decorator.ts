import { CREATE_USER_VALIDATION_EXAMPLES } from '../../examples/validation.examples';
import { applyDecorators } from '@nestjs/common';
import {
  ApiBody,
  ApiCreatedResponse,
  ApiExcludeEndpoint,
  ApiExtension,
  ApiOperation,
} from '@nestjs/swagger';
import { UserResponseDto } from '../../../../../users/dtos/user-response.dto';
import { CreateUserDto } from '../../../../../users/dtos/create-user.dto';
import { ApiConflictErrorResponse } from '../api-conflict-error-response.decorator';
import { ApiInternalErrorResponse } from '../api-internal-error-response.decorator';
import { ApiValidationErrorResponse } from '../api-validation-error-response.decorator';

export const ApiCreateUserDocs = () =>
  applyDecorators(
    ApiExcludeEndpoint(),
    ApiExtension('x-docs-order', 10),
    ApiOperation({
      operationId: 'usersCreate',
      summary: 'Create a user',
      description:
        'Creates a new user record directly. Prefer `POST /auth/register` for the standard registration flow with token issuance.',
    }),
    ApiBody({ type: CreateUserDto }),
    ApiCreatedResponse({
      description: 'User created successfully.',
      type: UserResponseDto,
    }),
    ApiValidationErrorResponse(CREATE_USER_VALIDATION_EXAMPLES),
    ApiConflictErrorResponse(),
    ApiInternalErrorResponse(),
  );
