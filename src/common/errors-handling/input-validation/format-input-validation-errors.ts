import { ArgumentsHost } from '@nestjs/common';
import { ValidationError } from 'class-validator';
import { ErrorResponseInterface } from '../error-response.interface';

export function formatInputValidationErrors(
  errors: ValidationError[],
  _host: ArgumentsHost,
): ErrorResponseInterface[] {
  return errors.flatMap((error) =>
    Object.entries(error.constraints ?? {}).map(([code, message]) => ({
      code,
      field: error.property,
      message,
    })),
  );
}
