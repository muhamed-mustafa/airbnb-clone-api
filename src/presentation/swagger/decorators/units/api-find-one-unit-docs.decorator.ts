import { applyDecorators } from '@nestjs/common';
import { ApiExtension, ApiOkResponse, ApiOperation } from '@nestjs/swagger';
import { UnitResponseDto } from '@presentation/units/dtos/unit-response.dto';
import { ApiInternalErrorResponse } from '../api-internal-error-response.decorator';
import { ApiUnitIdParam, ApiUnitNotFoundResponse } from './api-unit-responses.decorator';

export const ApiFindOneUnitDocs = () =>
  applyDecorators(
    ApiExtension('x-docs-order', 20),
    ApiOperation({
      operationId: 'unitsFindOne',
      summary: 'Get an accommodation listing',
      description:
        'Returns a unit by its MongoDB ObjectId. Requires a user access token. Reading does not perform an ownership check.',
    }),
    ApiUnitIdParam(),
    ApiOkResponse({ description: 'Unit found.', type: UnitResponseDto }),
    ApiUnitNotFoundResponse(),
    ApiInternalErrorResponse(),
  );
