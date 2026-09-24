import { applyDecorators } from '@nestjs/common';
import { ApiExtension, ApiOperation, ApiOkResponse } from '@nestjs/swagger';
import { UnitCategoryResponseDto } from '@presentation/unit-categories/dtos/unit-category-response.dto';

import { ApiInternalErrorResponse } from '../api-internal-error-response.decorator';
import {
  ApiUnitCategoryValidationResponse,
  ApiUnitCategoryIdParam,
  ApiUnitCategoryNotFoundResponse,
} from './api-unit-category-responses.decorator';

export const ApiFindUnitCategoryByIdDocs = () =>
  applyDecorators(
    ApiExtension('x-docs-order', 30),
    ApiOperation({
      operationId: 'unitCategoriesFindById',
      summary: 'Get a unit category',
      description: 'Returns a non-deleted unit category by its ID.',
    }),
    ApiUnitCategoryIdParam(),
    ApiOkResponse({ description: 'Unit category found.', type: UnitCategoryResponseDto }),
    ApiUnitCategoryNotFoundResponse(),
    ApiUnitCategoryValidationResponse(),
    ApiInternalErrorResponse(),
  );
