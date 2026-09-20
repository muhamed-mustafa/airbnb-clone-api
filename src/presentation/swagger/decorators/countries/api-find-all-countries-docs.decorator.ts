import { applyDecorators } from '@nestjs/common';
import { ApiExtension, ApiOperation, ApiQuery, ApiOkResponse } from '@nestjs/swagger';
import { CountryResponseDto } from '@presentation/countries/dtos/country-response.dto';

import { ApiInternalErrorResponse } from '../api-internal-error-response.decorator';
import { ApiCountryValidationResponse } from './api-country-responses.decorator';

export const ApiFindAllCountriesDocs = () =>
  applyDecorators(
    ApiExtension('x-docs-order', 20),
    ApiOperation({
      operationId: 'countriesFindAll',
      summary: 'List countries',
      description:
        'Returns a page of non-deleted countries. Name uses a literal, case-insensitive partial match; code uses an exact match. The response is an array without pagination metadata.',
    }),
    ApiQuery({
      name: 'name',
      required: false,
      type: String,
      description: 'Partial country name.',
      example: 'egy',
    }),
    ApiQuery({
      name: 'code',
      required: false,
      type: String,
      description: 'Exact country code.',
      example: 'EG',
    }),
    ApiQuery({
      name: 'page',
      required: false,
      schema: { type: 'integer', minimum: 1, default: 1 },
    }),
    ApiQuery({
      name: 'limit',
      required: false,
      schema: { type: 'integer', minimum: 1, maximum: 100, default: 10 },
    }),
    ApiOkResponse({
      description: 'Matching countries, or an empty array.',
      type: CountryResponseDto,
      isArray: true,
    }),
    ApiCountryValidationResponse(),
    ApiInternalErrorResponse(),
  );
