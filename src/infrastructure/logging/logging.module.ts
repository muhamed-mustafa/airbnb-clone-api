import { Module } from '@nestjs/common';
import { LOGGER } from '../../common/logging/logger.token';
import { RequestContextModule } from '../../common/request-context/request-context.module';
import { PinoLoggerService } from './pino-logger.service';

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
