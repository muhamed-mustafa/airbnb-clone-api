import { applyDecorators } from '@nestjs/common';
import { ApiExtension, ApiOperation, ApiBody, ApiCreatedResponse } from '@nestjs/swagger';
import { UnitCategoryResponseDto } from '@presentation/unit-categories/dtos/unit-category-response.dto';
import { CreateUnitCategoryDto } from '@presentation/unit-categories/dtos/create-unit-category.dto';
import { ApiInternalErrorResponse } from '../api-internal-error-response.decorator';
import {
  ApiUnitCategoryValidationResponse,
  ApiUnitCategoryConflictResponse,
} from './api-unit-category-responses.decorator';

export const ApiCreateUnitCategoryDocs = () =>
  applyDecorators(
    ApiExtension('x-docs-order', 10),
    ApiOperation({
      operationId: 'unitCategoriesCreate',
      summary: 'Create a unit category',
      description: 'Creates a unit category with a unique name.',
    }),
    ApiBody({ type: CreateUnitCategoryDto }),
    ApiCreatedResponse({
      description: 'Unit category created successfully.',
      type: UnitCategoryResponseDto,
    }),
    ApiUnitCategoryConflictResponse(),
    ApiUnitCategoryValidationResponse(),
    ApiInternalErrorResponse(),
  );
