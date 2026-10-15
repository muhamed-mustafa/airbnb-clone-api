import { applyDecorators } from '@nestjs/common';
import {
  ApiBody,
  ApiConsumes,
  ApiCreatedResponse,
  ApiExtension,
  ApiOperation,
} from '@nestjs/swagger';
import { CreateUnitDto } from '@presentation/units/dtos/create-unit.dto';
import { UnitResponseDto } from '@presentation/units/dtos/unit-response.dto';
import { ApiInternalErrorResponse } from '../api-internal-error-response.decorator';
import {
  ApiUnitReferenceNotFoundResponse,
  ApiUnitValidationResponse,
} from './api-unit-responses.decorator';

export const ApiCreateUnitDocs = () =>
  applyDecorators(
    ApiExtension('x-docs-order', 10),
    ApiOperation({
      operationId: 'unitsCreate',
      summary: 'Create an accommodation listing',
      description:
        'Creates a unit owned by the authenticated user. The owner is taken from the access token and is not accepted from the request body. All declared body fields are required. Country, city, accommodation type and application settings must exist. Daily cost must meet the configured minimum. Photos are string references, not multipart uploads.',
    }),
    ApiConsumes('application/json'),
    ApiBody({ type: CreateUnitDto }),
    ApiCreatedResponse({ description: 'Unit created successfully.', type: UnitResponseDto }),
    ApiUnitValidationResponse(),
    ApiUnitReferenceNotFoundResponse(),
    ApiInternalErrorResponse(),
  );
