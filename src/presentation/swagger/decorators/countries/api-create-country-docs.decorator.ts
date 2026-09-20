import { applyDecorators } from '@nestjs/common';
import { ApiExtension, ApiOperation, ApiBody, ApiCreatedResponse } from '@nestjs/swagger';
import { CountryResponseDto } from '@presentation/countries/dtos/country-response.dto';
import { CreateCountryDto } from '@presentation/countries/dtos/create-country.dto';
import { ApiInternalErrorResponse } from '../api-internal-error-response.decorator';
import {
  ApiCountryValidationResponse,
  ApiCountryConflictResponse,
} from './api-country-responses.decorator';

export const ApiCreateCountryDocs = () =>
  applyDecorators(
    ApiExtension('x-docs-order', 10),
    ApiOperation({
      operationId: 'countriesCreate',
      summary: 'Create a country',
      description: 'Creates a country with a unique name and code.',
    }),
    ApiBody({ type: CreateCountryDto }),
    ApiCreatedResponse({ description: 'Country created successfully.', type: CountryResponseDto }),
    ApiCountryConflictResponse(),
    ApiCountryValidationResponse(),
    ApiInternalErrorResponse(),
  );
