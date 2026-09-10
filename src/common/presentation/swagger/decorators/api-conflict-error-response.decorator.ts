import { applyDecorators } from '@nestjs/common';
import { ApiConflictResponse } from '@nestjs/swagger';
import { HttpErrorsResponseDto } from '../dtos/http-errors-response.dto';

export const ApiConflictErrorResponse = () =>
  applyDecorators(
    ApiConflictResponse({
      description: 'A resource conflict occurred (e.g. duplicate email or phone).',
      type: HttpErrorsResponseDto,
    }),
  );
