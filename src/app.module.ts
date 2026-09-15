import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';
import { AuthModule } from './auth/auth.module';
import { GlobalExceptionFilter } from './common/errors-handling/filters/global-exception-filter';
import { HttpExceptionFilter } from './common/errors-handling/filters/http-exception.filter';
import { ValidationExceptionFilter } from './common/errors-handling/filters/validation-exception.filter';
import { ApplicationExceptionFilter } from './common/presentation/filters/application-exception.filter';
import { RequestContextMiddleware } from './common/presentation/middleware/request-context/request-context.middleware';
import { RequestContextModule } from './common/request-context/request-context.module';
import { CoreModule } from './core.module';
import { LoggingModule } from './infrastructure/logging/logging.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [CoreModule, UsersModule, AuthModule, RequestContextModule, LoggingModule],
  providers: [
    {
      provide: APP_FILTER,
      useClass: GlobalExceptionFilter,
    },
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
    {
      provide: APP_FILTER,
      useClass: ValidationExceptionFilter,
    },
    {
      provide: APP_FILTER,
      useClass: ApplicationExceptionFilter,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer
      .apply(RequestContextMiddleware)
      .forRoutes({ path: '*path', method: RequestMethod.ALL });
  }
}
