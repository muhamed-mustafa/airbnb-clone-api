import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';
import { AuthModule } from './auth.module';
import { GlobalExceptionFilter } from '@presentation/filters/global-exception-filter';
import { HttpExceptionFilter } from '@presentation/filters/http-exception.filter';
import { ValidationExceptionFilter } from '@presentation/filters/validation-exception.filter';
import { ApplicationExceptionFilter } from '@presentation/filters/application-exception.filter';
import { RequestContextMiddleware } from '@presentation/middleware/request-context/request-context.middleware';
import { RequestContextModule } from '@common/request-context/request-context.module';
import { CoreModule } from './core.module';
import { LoggingModule } from '@infrastructure/logging/logging.module';
import { UsersModule } from './users.module';
import { CountriesModule } from './countries.module';
import { CitiesModule } from './cities.module';
import { CurrenciesModule } from './currencies.module';
import { UnitCategoriesModule } from './unit-categories.module';

@Module({
  imports: [
    CoreModule,
    UsersModule,
    AuthModule,
    RequestContextModule,
    LoggingModule,
    CountriesModule,
    CitiesModule,
    CurrenciesModule,
    UnitCategoriesModule,
  ],
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
