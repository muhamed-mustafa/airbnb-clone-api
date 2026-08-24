import { ArgumentsHost, Catch, ExceptionFilter, HttpException } from '@nestjs/common';
import { Response } from 'express';
import { I18nContext } from 'nestjs-i18n';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    const exceptionResponse = exception.getResponse();

    const message =
      typeof exceptionResponse === 'string'
        ? exceptionResponse
        : this.getMessage(exceptionResponse);

    const i18n = I18nContext.current();

    const translatedMessage = i18n?.t(message) ?? message;

    response.status(exception.getStatus()).json({
      errors: [{ message: translatedMessage }],
    });
  }

  private getMessage(response: string | object): string {
    if (typeof response === 'object' && response !== null && 'message' in response) {
      const message = response.message;

      return Array.isArray(message) ? message.join(', ') : String(message);
    }

    return 'errors.internal_server_error';
  }
}
