import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import pino, { Logger as PinoLogger } from 'pino';
import { EnvironmentVariables } from '../../common/config/env.types';
import { LogContext, Logger } from '../../common/logging/logger';
import { RequestContext } from '../../common/request-context/request-context';

@Injectable()
export class PinoLoggerService implements Logger {
  private readonly logger: PinoLogger;

  constructor(
    private readonly configService: ConfigService<EnvironmentVariables>,
    private readonly requestContext: RequestContext,
  ) {
    const environment = this.configService.getOrThrow<string>('NODE_ENV');
    this.logger = pino({
      redact: ['password', 'accessToken', 'refreshToken', 'apiKey'],
      level: environment === 'production' ? 'info' : 'debug',
      base: {
        service: 'airbnb-clone-api',
        environment,
      },
      ...(environment !== 'production' && {
        transport: {
          target: 'pino-pretty',
          options: {
            colorize: true,
            translateTime: 'SYS:standard',
            ignore: 'pid,hostname',
            singleLine: true,
          },
        },
      }),
    });
  }

  private withRequestContext(context?: LogContext): LogContext {
    const requestId = this.requestContext.get()?.requestId;

    return {
      ...context,
      ...(requestId && { requestId }),
    };
  }
  debug(message: string, context?: LogContext): void {
    this.logger.debug(this.withRequestContext(context), message);
  }

  info(message: string, context?: LogContext): void {
    this.logger.info(this.withRequestContext(context), message);
  }

  warn(message: string, context?: LogContext): void {
    this.logger.warn(this.withRequestContext(context), message);
  }

  error(error: Error, message?: string, context?: LogContext): void {
    this.logger.error({ err: error, ...this.withRequestContext(context) }, message);
  }
}
