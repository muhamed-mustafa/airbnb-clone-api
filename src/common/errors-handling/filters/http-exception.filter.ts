import { ArgumentsHost, Catch, ExceptionFilter, HttpException } from '@nestjs/common';
import { Response } from 'express';
import { I18nContext } from 'nestjs-i18n';

interface HttpErrorResponse {
  code: string;
  field?: string;
}

const isHttpErrorResponse = (value: unknown): value is HttpErrorResponse => {
  return (
    typeof value === 'object' && value !== null && 'code' in value && typeof value.code === 'string'
  );
};

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    const exceptionResponse: unknown = exception.getResponse();

    const error: HttpErrorResponse = isHttpErrorResponse(exceptionResponse)
      ? exceptionResponse
      : {
          code:
            typeof exceptionResponse === 'string'
              ? exceptionResponse
              : 'errors.INTERNAL_SERVER_ERROR',
        };

    const i18n = I18nContext.current(host);
    const message = i18n?.t(error.code) ?? error.code;

    response.status(exception.getStatus()).json({
      errors: [
        {
          code: error.code,
          message,
          ...(error.field && { field: error.field }),
        },
      ],
    });
  }
}
