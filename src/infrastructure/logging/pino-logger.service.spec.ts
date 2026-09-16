import { ConfigService } from '@nestjs/config';
import pino from 'pino';

import { EnvironmentVariables } from '@common/config/env.types';
import { RequestContext } from '@common/request-context/request-context';
import { PinoLoggerService } from './pino-logger.service';

jest.mock('pino', () => ({
  __esModule: true,
  default: jest.fn(() => ({
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  })),
}));

type MockPinoLogger = {
  debug: jest.Mock;
  info: jest.Mock;
  warn: jest.Mock;
  error: jest.Mock;
};

describe('PinoLoggerService', () => {
  it('should include requestId from RequestContext in logs', async () => {
    const requestContext = new RequestContext();

    const configService = {
      getOrThrow: jest.fn().mockReturnValue('development'),
    } as unknown as ConfigService<EnvironmentVariables>;

    const logger = new PinoLoggerService(configService, requestContext);

    const mockedPino = jest.mocked(pino);
    const pinoLogger = mockedPino.mock.results[0].value as MockPinoLogger;

    await requestContext.run({ requestId: 'request-123' }, async () => {
      await new Promise((resolve) => setTimeout(resolve, 10));

      logger.info('User registered');
    });

    expect(pinoLogger.info).toHaveBeenCalledWith(
      {
        requestId: 'request-123',
      },
      'User registered',
    );
  });

  it('should use info as the minimum log level in production', () => {
    const requestContext = new RequestContext();

    const configService = {
      getOrThrow: jest.fn().mockReturnValue('production'),
    } as unknown as ConfigService<EnvironmentVariables>;

    new PinoLoggerService(configService, requestContext);

    expect(pino).toHaveBeenCalledWith(
      expect.objectContaining({
        level: 'info',
      }),
    );
  });
});
