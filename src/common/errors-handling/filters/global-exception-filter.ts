import { ArgumentsHost, Catch, ExceptionFilter, HttpStatus, Logger } from '@nestjs/common';
import { Response } from 'express';
import { I18nContext } from 'nestjs-i18n';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();

    const response = ctx.getResponse<Response>();

    this.logger.error(exception);

    const i18n = I18nContext.current(host);

    const message = i18n?.t('errors.internal_server_error') ?? 'Internal server error';

    response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      errors: [{ message }],
    });
  }
}
