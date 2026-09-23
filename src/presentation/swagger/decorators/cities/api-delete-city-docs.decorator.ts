import { applyDecorators } from '@nestjs/common';
import { ApiExtension, ApiNoContentResponse, ApiOperation } from '@nestjs/swagger';
import { ApiInternalErrorResponse } from '../api-internal-error-response.decorator';
import {
  ApiCityIdParam,
  ApiCityNotFoundResponse,
  ApiCityValidationResponse,
} from './api-city-responses.decorator';

export const ApiDeleteCityDocs = () =>
  applyDecorators(
    ApiExtension('x-docs-order', 50),
    ApiOperation({
      operationId: 'citiesDelete',
      summary: 'Delete a city',
      description:
        'Soft deletes a city by setting isDeleted and deletedAt. The document remains stored.',
    }),
    ApiCityIdParam(),
    ApiNoContentResponse({ description: 'City soft deleted successfully. No response body.' }),
    ApiCityNotFoundResponse(),
    ApiCityValidationResponse(),
    ApiInternalErrorResponse(),
  );
