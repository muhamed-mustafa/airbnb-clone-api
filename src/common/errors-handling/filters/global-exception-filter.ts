import { ArgumentsHost, Catch, ExceptionFilter, HttpStatus, Logger } from '@nestjs/common';
import { Response } from 'express';
import { I18nService } from 'nestjs-i18n';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  constructor(private readonly I18nService: I18nService) {}

  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    this.logger.error(exception);

    const message = this.I18nService.translate('errors.internal_server_error');

    response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      errors: [{ message }],
    });
  }
}
