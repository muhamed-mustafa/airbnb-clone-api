import { applyDecorators } from '@nestjs/common';
import {
  ApiBody,
  ApiConsumes,
  ApiExtension,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiOperation,
} from '@nestjs/swagger';
import { UpdateUnitDto } from '@presentation/units/dtos/update-unit.dto';
import { UnitResponseDto } from '@presentation/units/dtos/unit-response.dto';
import { ApiInternalErrorResponse } from '../api-internal-error-response.decorator';
import {
  ApiUnitIdParam,
  ApiUnitNotFoundResponse,
  ApiUnitValidationResponse,
} from './api-unit-responses.decorator';

export const ApiUpdateUnitDocs = () =>
  applyDecorators(
    ApiExtension('x-docs-order', 30),
    ApiOperation({
      operationId: 'unitsUpdate',
      summary: 'Update an accommodation listing',
      description:
        'Partially updates a unit owned by the authenticated user. Send only fields to change; the request cannot change its owner. Supplied reference fields must exist, and a supplied daily cost must meet the configured minimum. Photos remain string references, not uploaded files.',
    }),
    ApiUnitIdParam(),
    ApiConsumes('application/json'),
    ApiBody({
      type: UpdateUnitDto,
      examples: {
        priceAndAvailability: {
          summary: 'Change daily cost and availability',
          value: { costPerDay: 1800, availability: false },
        },
        title: {
          summary: 'Change only the title',
          value: { title: 'Renovated apartment near the sea' },
        },
      },
    }),
    ApiOkResponse({ description: 'Updated unit returned.', type: UnitResponseDto }),
    ApiUnitValidationResponse(),
    ApiUnitNotFoundResponse(true),
    ApiForbiddenResponse({
      description:
        'The authenticated role is not allowed, or the user is not the unit owner. Ownership rejection returns code UNIT_ACCESS_DENIED.',
      content: {
        'application/json': {
          examples: {
            notOwner: {
              summary: 'Unit belongs to another user',
              value: {
                errors: [
                  {
                    code: 'UNIT_ACCESS_DENIED',
                    message: 'You do not have permission to access this unit.',
                  },
                ],
              },
            },
          },
        },
      },
    }),
    ApiInternalErrorResponse(),
  );
