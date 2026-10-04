import { applyDecorators } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiExtension,
  ApiOkResponse,
  ApiOperation,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { CurrentUserResponseDto } from '@presentation/auth/dtos/current-user-response.dto';
import { SWAGGER_BEARER_AUTH } from '../../swagger.constants';
import { ApiInternalErrorResponse } from '../api-internal-error-response.decorator';

export const ApiGetMeDocs = () =>
  applyDecorators(
    ApiExtension('x-docs-order', 40),
    ApiOperation({
      operationId: 'authGetMe',
      summary: 'Get current user',
      description: 'Returns the authenticated user ID and role from the JWT access token.',
    }),
    ApiBearerAuth(SWAGGER_BEARER_AUTH),
    ApiOkResponse({
      description: 'Returns the authenticated user ID and role.',
      type: CurrentUserResponseDto,
    }),
    ApiUnauthorizedResponse({
      description: 'The access token is missing, invalid, or expired.',
    }),
    ApiInternalErrorResponse(),
  );
