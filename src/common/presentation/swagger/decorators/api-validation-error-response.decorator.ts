import { applyDecorators } from '@nestjs/common';
import { ApiBadRequestResponse } from '@nestjs/swagger';
import { ValidationErrorsResponseDto } from '../dtos/validation-errors-response.dto';

export const ApiValidationErrorResponse = () =>
  applyDecorators(
    ApiBadRequestResponse({
      description:
        'Request validation failed. Returned when required fields are missing, formats are invalid, or unknown fields are present.',
      type: ValidationErrorsResponseDto,
    }),
  );
