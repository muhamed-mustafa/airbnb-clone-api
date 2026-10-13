import type { Logger } from '@common/logging/logger';
import { LOGGER } from '@common/logging/logger.token';
import { Inject, Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { randomUUID } from 'node:crypto';
import { RequestContext } from '@common/request-context/request-context';

@Injectable()
export class RequestContextMiddleware implements NestMiddleware {
  constructor(
    private readonly requestContext: RequestContext,
    @Inject(LOGGER) private readonly logger: Logger,
  ) {}

  use(request: Request, response: Response, next: NextFunction): void {
    const requestId = request.header('x-request-id') ?? randomUUID();

    response.setHeader('x-request-id', requestId);
    const startedAt = performance.now();
    let recorded = false;
    const record = (aborted: boolean) => {
      if (recorded) return;
      recorded = true;
      // Route templates omit query strings, account details and dynamic parameter values.
      const route = request.route as { path?: unknown } | undefined;
      const context = {
        requestId,
        method: request.method,
        route: typeof route?.path === 'string' ? route.path : 'unmatched',
        statusCode: response.statusCode,
        durationMs: Math.round(performance.now() - startedAt),
      };
      if (aborted) this.logger.warn('HTTP request aborted', context);
      else if (response.statusCode >= 400) this.logger.warn('HTTP request rejected', context);
      else this.logger.info('HTTP request completed', context);
    };
    response.once('finish', () => record(false));
    response.once('close', () => record(!response.writableFinished));

    this.requestContext.run(
      {
        requestId,
      },
      next,
    );
  }
}
