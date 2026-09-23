import { applyDecorators } from '@nestjs/common';
import { ApiExtension, ApiOperation, ApiNoContentResponse } from '@nestjs/swagger';

import { ApiInternalErrorResponse } from '../api-internal-error-response.decorator';
import {
  ApiCountryValidationResponse,
  ApiCountryIdParam,
  ApiCountryNotFoundResponse,
} from './api-country-responses.decorator';

export const ApiDeleteCountryDocs = () =>
  applyDecorators(
    ApiExtension('x-docs-order', 50),
    ApiOperation({
      operationId: 'countriesDelete',
      summary: 'Delete a country',
      description:
        'Soft deletes a country by setting isDeleted and deletedAt, and soft deletes all of its active cities the same way. No documents are removed.',
    }),
    ApiCountryIdParam(),
    ApiNoContentResponse({
      description: 'Country and its cities soft deleted successfully. No response body.',
    }),
    ApiCountryNotFoundResponse(),
    ApiCountryValidationResponse(),
    ApiInternalErrorResponse(),
  );
