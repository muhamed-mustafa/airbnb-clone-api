import { applyDecorators } from '@nestjs/common';
import { ApiExtension, ApiOperation, ApiBody, ApiOkResponse } from '@nestjs/swagger';
import { CountryResponseDto } from '@presentation/countries/dtos/country-response.dto';
import { UpdateCountryDto } from '@presentation/countries/dtos/update-country.dto';
import { ApiInternalErrorResponse } from '../api-internal-error-response.decorator';
import {
  ApiCountryValidationResponse,
  ApiCountryIdParam,
  ApiCountryNotFoundResponse,
  ApiCountryConflictResponse,
} from './api-country-responses.decorator';

export const ApiUpdateCountryDocs = () =>
  applyDecorators(
    ApiExtension('x-docs-order', 40),
    ApiOperation({
      operationId: 'countriesUpdate',
      summary: 'Update a country',
      description: 'Updates only the supplied name or code of a non-deleted country.',
    }),
    ApiCountryIdParam(),
    ApiBody({ type: UpdateCountryDto }),
    ApiOkResponse({ description: 'Country after the update.', type: CountryResponseDto }),
    ApiCountryNotFoundResponse(),
    ApiCountryConflictResponse(),
    ApiCountryValidationResponse(),
    ApiInternalErrorResponse(),
  );
