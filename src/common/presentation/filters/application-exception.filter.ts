import { ArgumentsHost, Catch, ExceptionFilter } from '@nestjs/common';
import { Response } from 'express';
import { I18nService } from 'nestjs-i18n';
import { ApplicationError } from '../../errors/application.error';
import {
  applicationErrorMessageMap,
  applicationErrorStatusMap,
} from '../errors/application-error-status.map';

@Catch(ApplicationError)
export class ApplicationExceptionFilter implements ExceptionFilter {
  constructor(private readonly i18nService: I18nService) {}

  catch(exception: ApplicationError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    const status = applicationErrorStatusMap[exception.code];

    const messageKey = applicationErrorMessageMap[exception.code];

    const message = this.i18nService.translate(messageKey);

    response.status(status).json({
      code: exception.code,
      message,
    });
  }
}
