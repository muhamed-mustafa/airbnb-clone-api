import { REFRESH_TOKEN_VALIDATION_EXAMPLES } from '../../examples/validation.examples';
import { applyDecorators } from '@nestjs/common';
import { ApiBody, ApiCreatedResponse, ApiExtension, ApiOperation } from '@nestjs/swagger';
import { AuthResponseDto } from '../../../auth/dtos/auth-response.dto';
import { RefreshTokenDto } from '../../../auth/dtos/refresh-token.dto';
import { ApiInternalErrorResponse } from '../api-internal-error-response.decorator';
import { ApiValidationErrorResponse } from '../api-validation-error-response.decorator';
import { ApiInvalidTokenResponse } from '../api-application-error-responses.decorator';

export const ApiRefreshTokenDocs = () =>
  applyDecorators(
    ApiExtension('x-docs-order', 30),
    ApiOperation({
      operationId: 'authRefreshToken',
      summary: 'Refresh access token',
      description:
        'Exchanges a valid refresh token for a new access token and refresh token pair. The previous refresh token is invalidated.',
    }),
    ApiBody({ type: RefreshTokenDto }),
    ApiCreatedResponse({
      description: 'Tokens refreshed successfully. Returns a new access and refresh token pair.',
      type: AuthResponseDto,
    }),
    ApiValidationErrorResponse(REFRESH_TOKEN_VALIDATION_EXAMPLES),
    ApiInvalidTokenResponse(),
    ApiInternalErrorResponse(),
  );
