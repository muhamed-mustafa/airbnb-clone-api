import { applyDecorators } from '@nestjs/common';
import { ApiExtension, ApiOperation, ApiOkResponse } from '@nestjs/swagger';
import { CountryResponseDto } from '@presentation/countries/dtos/country-response.dto';

import { ApiInternalErrorResponse } from '../api-internal-error-response.decorator';
import {
  ApiCountryValidationResponse,
  ApiCountryIdParam,
  ApiCountryNotFoundResponse,
} from './api-country-responses.decorator';

export const ApiFindCountryByIdDocs = () =>
  applyDecorators(
    ApiExtension('x-docs-order', 30),
    ApiOperation({
      operationId: 'countriesFindById',
      summary: 'Get a country',
      description: 'Returns a non-deleted country by its ID.',
    }),
    ApiCountryIdParam(),
    ApiOkResponse({ description: 'Country found.', type: CountryResponseDto }),
    ApiCountryNotFoundResponse(),
    ApiCountryValidationResponse(),
    ApiInternalErrorResponse(),
  );
