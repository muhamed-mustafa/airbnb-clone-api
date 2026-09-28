import { Global, Module } from '@nestjs/common';
import { LOGGER } from '@common/logging/logger.token';
import { RequestContextModule } from '@common/request-context/request-context.module';
import { PinoLoggerService } from './pino-logger.service';

// Global: logging is a cross-cutting concern injected by use-cases across every feature
// module, so LOGGER is exposed application-wide instead of importing LoggingModule everywhere.
@Global()
@Module({
  providers: [
    {
      provide: LOGGER,
      useClass: PinoLoggerService,
    },
  ],
  exports: [LOGGER],
  imports: [RequestContextModule],
})
export class LoggingModule {}
