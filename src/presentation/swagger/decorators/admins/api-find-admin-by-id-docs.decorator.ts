import { applyDecorators } from '@nestjs/common';
import { ApiExtension, ApiOkResponse, ApiOperation } from '@nestjs/swagger';
import { AdminResponseDto } from '@presentation/admin/dtos/admin-response.dto';
import { ApiInternalErrorResponse } from '../api-internal-error-response.decorator';
import {
  ApiAdminIdParam,
  ApiAdminNotFoundResponse,
  ApiAdminValidationResponse,
} from './api-admin-responses.decorator';

export const ApiFindAdminByIdDocs = () =>
  applyDecorators(
    ApiExtension('x-docs-order', 30),
    ApiOperation({
      operationId: 'adminsFindById',
      summary: 'Get an admin',
      description: 'Returns a non-deleted admin by its ID.',
    }),
    ApiAdminIdParam(),
    ApiOkResponse({ description: 'Admin found.', type: AdminResponseDto }),
    ApiAdminNotFoundResponse(),
    ApiAdminValidationResponse(),
    ApiInternalErrorResponse(),
  );
