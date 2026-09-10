import { applyDecorators } from '@nestjs/common';
import { ApiInternalServerErrorResponse } from '@nestjs/swagger';
import { InternalErrorResponseDto } from '../dtos/internal-error-response.dto';

export const ApiInternalErrorResponse = () =>
  applyDecorators(
    ApiInternalServerErrorResponse({
      description: 'An unexpected server error occurred.',
      type: InternalErrorResponseDto,
    }),
  );
