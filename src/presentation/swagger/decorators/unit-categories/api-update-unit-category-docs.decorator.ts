import { applyDecorators } from '@nestjs/common';
import { ApiExtension, ApiOperation, ApiBody, ApiOkResponse } from '@nestjs/swagger';
import { UnitCategoryResponseDto } from '@presentation/unit-categories/dtos/unit-category-response.dto';
import { UpdateUnitCategoryDto } from '@presentation/unit-categories/dtos/update-unit-category.dto';
import { ApiInternalErrorResponse } from '../api-internal-error-response.decorator';
import {
  ApiUnitCategoryValidationResponse,
  ApiUnitCategoryIdParam,
  ApiUnitCategoryNotFoundResponse,
  ApiUnitCategoryConflictResponse,
} from './api-unit-category-responses.decorator';

export const ApiUpdateUnitCategoryDocs = () =>
  applyDecorators(
    ApiExtension('x-docs-order', 40),
    ApiOperation({
      operationId: 'unitCategoriesUpdate',
      summary: 'Update a unit category',
      description: 'Updates only the supplied name or icon of a non-deleted unit category.',
    }),
    ApiUnitCategoryIdParam(),
    ApiBody({ type: UpdateUnitCategoryDto }),
    ApiOkResponse({
      description: 'Unit category after the update.',
      type: UnitCategoryResponseDto,
    }),
    ApiUnitCategoryNotFoundResponse(),
    ApiUnitCategoryConflictResponse(),
    ApiUnitCategoryValidationResponse(),
    ApiInternalErrorResponse(),
  );
