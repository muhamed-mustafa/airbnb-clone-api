import { RequestContextModule } from '@common/request-context/request-context.module';
import { LoggingModule } from '@infrastructure/logging/logging.module';
import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { ApplicationExceptionFilter } from '@presentation/filters/application-exception.filter';
import { GlobalExceptionFilter } from '@presentation/filters/global-exception-filter';
import { HttpExceptionFilter } from '@presentation/filters/http-exception.filter';
import { ValidationExceptionFilter } from '@presentation/filters/validation-exception.filter';
import { RequestContextMiddleware } from '@presentation/middleware/request-context/request-context.middleware';
import { TransformResponseInterceptor } from '../common/interceptors/transform-response.interceptor';
import { AdminModule } from './admin.module';
import { AppSettingsModule } from './app-settings.module';
import { AuthModule } from './auth.module';
import { CitiesModule } from './cities.module';
import { CoreModule } from './core.module';
import { CountriesModule } from './countries.module';
import { CurrenciesModule } from './currencies.module';
import { UnitCategoriesModule } from './unit-categories.module';
import { UsersModule } from './users.module';

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
    AppSettingsModule,
    AdminModule,
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
    {
      provide: APP_INTERCEPTOR,
      useClass: TransformResponseInterceptor,
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
