import { applyDecorators } from '@nestjs/common';
import {
  ApiExtension,
  ApiExtraModels,
  ApiForbiddenResponse,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiOperation,
  getSchemaPath,
} from '@nestjs/swagger';
import { UnitResponseDto } from '@presentation/units/dtos/unit-response.dto';
import { ApiInternalErrorResponse } from '../api-internal-error-response.decorator';
import { ApiValidationErrorResponse } from '../api-validation-error-response.decorator';
import { ApiUnitIdParam, ApiUnitNotFoundResponse } from './api-unit-responses.decorator';

export const ApiUnitIdValidationResponse = () =>
  ApiValidationErrorResponse({
    invalidId: {
      summary: 'Invalid unit ObjectId',
      value: { errors: [{ code: 'isMongoId', field: 'id', message: 'id must be a mongodb id' }] },
    },
  });

export const ApiUnitLifecycleDocs = (action: 'activate' | 'deactivate' | 'delete', order: number) =>
  applyDecorators(
    ApiExtension('x-docs-order', order),
    ApiOperation({
      operationId: `units${action[0].toUpperCase()}${action.slice(1)}`,
      summary: `${action[0].toUpperCase()}${action.slice(1)} an accommodation listing`,
      description:
        action === 'delete'
          ? 'Soft deletes a unit owned by the authenticated user, records deletedAt and sets isActive=false. No request body. Deleted units cannot be read, edited or reactivated; subsequent operations return 404.'
          : `Sets isActive=${action === 'activate'} for a unit owned by the authenticated user. No request body. Repeating this operation is allowed. Availability is unchanged. Inactive units are hidden from public browsing but remain in the owner list.`,
    }),
    ApiUnitIdParam(),
    ApiUnitIdValidationResponse(),
    ApiUnitNotFoundResponse(),
    ApiForbiddenResponse({
      description: 'The role is not allowed, or the user is not the unit owner.',
      content: {
        'application/json': {
          examples: {
            notOwner: {
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
    ...(action === 'delete'
      ? [ApiNoContentResponse({ description: 'Unit soft deleted. Empty response body.' })]
      : [
          ApiExtraModels(UnitResponseDto),
          ApiOkResponse({
            description: 'Unit returned with its new active state.',
            schema: {
              allOf: [
                { $ref: getSchemaPath(UnitResponseDto) },
                {
                  type: 'object',
                  properties: {
                    isActive: {
                      type: 'boolean',
                      enum: [action === 'activate'],
                      example: action === 'activate',
                    },
                  },
                },
              ],
            },
          }),
        ]),
    ApiInternalErrorResponse(),
  );
