import { applyDecorators } from '@nestjs/common';
import { ApiBody, ApiExtension, ApiOkResponse, ApiOperation } from '@nestjs/swagger';
import { CityResponseDto } from '@presentation/cities/dtos/city-response.dto';
import { UpdateCityDto } from '@presentation/cities/dtos/update-city.dto';
import { ApiInternalErrorResponse } from '../api-internal-error-response.decorator';
import {
  ApiCityConflictResponse,
  ApiCityIdParam,
  ApiCityOrCountryNotFoundResponse,
  ApiCityValidationResponse,
} from './api-city-responses.decorator';

export const ApiUpdateCityDocs = () =>
  applyDecorators(
    ApiExtension('x-docs-order', 40),
    ApiOperation({
      operationId: 'citiesUpdate',
      summary: 'Update a city',
      description:
        'Updates only the supplied name or country of a non-deleted city. A new country must exist.',
    }),
    ApiCityIdParam(),
    ApiBody({ type: UpdateCityDto }),
    ApiOkResponse({ description: 'City after the update.', type: CityResponseDto }),
    ApiCityOrCountryNotFoundResponse(),
    ApiCityConflictResponse(),
    ApiCityValidationResponse(),
    ApiInternalErrorResponse(),
  );
