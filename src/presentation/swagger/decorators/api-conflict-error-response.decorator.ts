import { applyDecorators } from '@nestjs/common';
import { ApiConflictResponse, ApiExtraModels, getSchemaPath } from '@nestjs/swagger';
import { HttpErrorsResponseDto } from '../dtos/http-errors-response.dto';

export const ApiConflictErrorResponse = () =>
  applyDecorators(
    ApiExtraModels(HttpErrorsResponseDto),
    ApiConflictResponse({
      description: 'A resource conflict occurred (e.g. duplicate email or phone).',
      content: {
        'application/json': {
          schema: { $ref: getSchemaPath(HttpErrorsResponseDto) },
          examples: {
            email: {
              summary: 'email ? already exists',
              value: {
                errors: [
                  {
                    code: 'auth.USER_ALREADY_EXISTS',
                    field: 'email',
                    message: 'User already exists',
                  },
                ],
              },
            },
            phone: {
              summary: 'phone ? already exists',
              value: {
                errors: [
                  {
                    code: 'auth.USER_ALREADY_EXISTS',
                    field: 'phone',
                    message: 'User already exists',
                  },
                ],
              },
            },
          },
        },
      },
    }),
  );
