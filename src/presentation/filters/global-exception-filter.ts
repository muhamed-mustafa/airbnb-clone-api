import { ArgumentsHost, Catch, ExceptionFilter, HttpStatus, Inject } from '@nestjs/common';
import { Response } from 'express';
import { I18nContext } from 'nestjs-i18n';
import type { Logger } from '../../common/logging/logger';
import { LOGGER } from '../../common/logging/logger.token';
import { toError } from '../../common/utils/to-error';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  constructor(@Inject(LOGGER) private readonly logger: Logger) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();

    const response = ctx.getResponse<Response>();

    this.logger.error(toError(exception), 'Unhandled exception');

    const i18n = I18nContext.current(host);

    const message = i18n?.t('errors.INTERNAL_SERVER_ERROR') ?? 'Internal server error';

    response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      errors: [{ message }],
    });
  }
}
