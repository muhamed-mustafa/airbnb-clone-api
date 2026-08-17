import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import { I18nService, I18nValidationException } from 'nestjs-i18n';
import { formatInputValidationErrors } from '../input-validation/format-input-validation-errors';

@Catch(I18nValidationException)
export class ValidationExceptionFilter implements ExceptionFilter {
  constructor(private readonly i18nService: I18nService) {}

  catch(exception: I18nValidationException, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    const formattedErrors = formatInputValidationErrors(
      exception.errors,
      this.i18nService,
      host,
    );

    response.status(HttpStatus.BAD_REQUEST).json({
      errors: formattedErrors,
    });
  }
}
