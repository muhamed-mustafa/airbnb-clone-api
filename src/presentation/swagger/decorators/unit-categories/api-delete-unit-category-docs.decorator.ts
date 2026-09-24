import { applyDecorators } from '@nestjs/common';
import { ApiExtension, ApiOperation, ApiNoContentResponse } from '@nestjs/swagger';

import { ApiInternalErrorResponse } from '../api-internal-error-response.decorator';
import {
  ApiUnitCategoryValidationResponse,
  ApiUnitCategoryIdParam,
  ApiUnitCategoryNotFoundResponse,
} from './api-unit-category-responses.decorator';

export const ApiDeleteUnitCategoryDocs = () =>
  applyDecorators(
    ApiExtension('x-docs-order', 50),
    ApiOperation({
      operationId: 'unitCategoriesDelete',
      summary: 'Delete a unit category',
      description:
        'Soft deletes a unit category by setting isDeleted and deletedAt. No documents are removed.',
    }),
    ApiUnitCategoryIdParam(),
    ApiNoContentResponse({
      description: 'Unit category soft deleted successfully. No response body.',
    }),
    ApiUnitCategoryNotFoundResponse(),
    ApiUnitCategoryValidationResponse(),
    ApiInternalErrorResponse(),
  );
