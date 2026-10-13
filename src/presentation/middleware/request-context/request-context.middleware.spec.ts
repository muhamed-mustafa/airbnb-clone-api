import { EventEmitter } from 'node:events';
import type { Request, Response } from 'express';
import type { Logger } from '@common/logging/logger';
import { RequestContext } from '@common/request-context/request-context';
import { RequestContextMiddleware } from './request-context.middleware';

describe('Request completion logging', () => {
  const setup = () => {
    const logger = {
      debug: jest.fn<ReturnType<Logger['debug']>, Parameters<Logger['debug']>>(),
      info: jest.fn<ReturnType<Logger['info']>, Parameters<Logger['info']>>(),
      warn: jest.fn<ReturnType<Logger['warn']>, Parameters<Logger['warn']>>(),
      error: jest.fn<ReturnType<Logger['error']>, Parameters<Logger['error']>>(),
    } satisfies jest.Mocked<Logger>;
    const requestContext = new RequestContext();
    const middleware = new RequestContextMiddleware(requestContext, logger);
    const request = {
      header: () => 'request-test',
      method: 'GET',
      route: { path: '/units/:id' },
      originalUrl: '/units/secret-id?accessToken=secret',
      body: { password: 'secret' },
    } as unknown as Request;
    const response = Object.assign(new EventEmitter(), {
      statusCode: 200,
      writableFinished: true,
      setHeader: jest.fn(),
    });
    const next = jest.fn(() => expect(requestContext.get()?.requestId).toBe('request-test'));
    middleware.use(request, response as unknown as Response, next);
    expect(next).toHaveBeenCalledTimes(1);
    return { logger, response };
  };
  it('logs completion once with a route template and no secrets', () => {
    const { logger, response } = setup();
    response.emit('finish');
    response.emit('close');
    expect(logger.info).toHaveBeenCalledTimes(1);
    expect(logger.info.mock.calls[0][0]).toBe('HTTP request completed');
    const context = logger.info.mock.calls[0][1];
    expect(context).toMatchObject({
      requestId: 'request-test',
      route: '/units/:id',
      method: 'GET',
      statusCode: 200,
    });
    expect(JSON.stringify(context)).not.toContain('secret');
    expect(context).not.toHaveProperty('body');
  });
  it('logs rejected responses without duplicating close', () => {
    const { logger, response } = setup();
    response.statusCode = 403;
    response.emit('finish');
    response.emit('close');
    expect(logger.warn).toHaveBeenCalledTimes(1);
    expect(logger.info).not.toHaveBeenCalled();
  });
  it('records a disconnected request once', () => {
    const { logger, response } = setup();
    response.writableFinished = false;
    response.emit('close');
    response.emit('finish');
    expect(logger.warn.mock.calls[0][0]).toBe('HTTP request aborted');
    expect(logger.warn).toHaveBeenCalledTimes(1);
    expect(logger.info).not.toHaveBeenCalled();
  });
});
