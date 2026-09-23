import { applyDecorators } from '@nestjs/common';
import { ApiExtension, ApiOkResponse, ApiOperation } from '@nestjs/swagger';
import { CityResponseDto } from '@presentation/cities/dtos/city-response.dto';
import { ApiInternalErrorResponse } from '../api-internal-error-response.decorator';
import {
  ApiCityIdParam,
  ApiCityNotFoundResponse,
  ApiCityValidationResponse,
} from './api-city-responses.decorator';

export const ApiFindCityByIdDocs = () =>
  applyDecorators(
    ApiExtension('x-docs-order', 30),
    ApiOperation({
      operationId: 'citiesFindById',
      summary: 'Get a city',
      description: 'Returns a non-deleted city by its ID.',
    }),
    ApiCityIdParam(),
    ApiOkResponse({ description: 'City found.', type: CityResponseDto }),
    ApiCityNotFoundResponse(),
    ApiCityValidationResponse(),
    ApiInternalErrorResponse(),
  );
