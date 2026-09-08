import { Module } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';
import { AuthModule } from './auth/auth.module';
import { GlobalExceptionFilter } from './common/errors-handling/filters/global-exception-filter';
import { HttpExceptionFilter } from './common/errors-handling/filters/http-exception.filter';
import { ValidationExceptionFilter } from './common/errors-handling/filters/validation-exception.filter';
import { ApplicationExceptionFilter } from './common/presentation/filters/application-exception.filter';
import { CoreModule } from './core.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [CoreModule, UsersModule, AuthModule],
  providers: [
    {
      provide: APP_FILTER,
      useClass: ValidationExceptionFilter,
    },
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
    {
      provide: APP_FILTER,
      useClass: GlobalExceptionFilter,
    },
    {
      provide: APP_FILTER,
      useClass: ApplicationExceptionFilter,
    },
  ],
})
export class AppModule {}
