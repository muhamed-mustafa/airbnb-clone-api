import { applyDecorators } from '@nestjs/common';
import { ApiBody, ApiCreatedResponse, ApiExtension, ApiOperation } from '@nestjs/swagger';
import { CityResponseDto } from '@presentation/cities/dtos/city-response.dto';
import { CreateCityDto } from '@presentation/cities/dtos/create-city.dto';
import { ApiInternalErrorResponse } from '../api-internal-error-response.decorator';
import {
  ApiCityConflictResponse,
  ApiCityCountryNotFoundResponse,
  ApiCityValidationResponse,
} from './api-city-responses.decorator';

export const ApiCreateCityDocs = () =>
  applyDecorators(
    ApiExtension('x-docs-order', 10),
    ApiOperation({
      operationId: 'citiesCreate',
      summary: 'Create a city',
      description:
        'Creates a city in an existing country. The name must be unique within that country.',
    }),
    ApiBody({ type: CreateCityDto }),
    ApiCreatedResponse({ description: 'City created successfully.', type: CityResponseDto }),
    ApiCityCountryNotFoundResponse(),
    ApiCityConflictResponse(),
    ApiCityValidationResponse(),
    ApiInternalErrorResponse(),
  );
