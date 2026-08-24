import { ArgumentsHost, Catch, ExceptionFilter } from '@nestjs/common';
import { Response } from 'express';
import { BaseCustomException } from '../custom-exceptions/base-custom.exception';

@Catch(BaseCustomException)
export class CustomExceptionFilter implements ExceptionFilter {
  catch(exception: BaseCustomException, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    response.status(exception.getStatus()).json({
      errors: exception.formatError(),
    });
  }
}
