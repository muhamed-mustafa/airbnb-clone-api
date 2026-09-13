import { applyDecorators } from '@nestjs/common';
import { ApiBadRequestResponse, ApiExtraModels, getSchemaPath } from '@nestjs/swagger';
import { ValidationErrorsResponseDto } from '../dtos/validation-errors-response.dto';

export const ApiValidationErrorResponse = (
  examples: Record<string, { summary: string; value: unknown }>,
) =>
  applyDecorators(
    ApiExtraModels(ValidationErrorsResponseDto),
    ApiBadRequestResponse({
      description:
        'Request validation failed. Returned when required fields are missing, formats are invalid, or unknown fields are present.',
      content: {
        'application/json': {
          schema: { $ref: getSchemaPath(ValidationErrorsResponseDto) },
          examples,
        },
      },
    }),
  );
