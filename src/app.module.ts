import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER } from '@nestjs/core';
import * as path from 'path';
import { AcceptLanguageResolver, I18nModule } from 'nestjs-i18n';
import envMapper from './common/config/env.mapper';
import { envSchema } from './common/config/env.schema';
import { CustomExceptionFilter } from './common/errors-handling/filters/custom-exception.filter';
import { ValidationExceptionFilter } from './common/errors-handling/filters/validation-exception.filter';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      load: [envMapper],
      validationSchema: envSchema,
    }),

    I18nModule.forRoot({
      fallbackLanguage: 'en',

      loaderOptions: {
        path: path.join(__dirname, '/i18n/'),
        watch: true,
      },

      resolvers: [AcceptLanguageResolver],
    }),
  ],

  providers: [
    {
      provide: APP_FILTER,
      useClass: CustomExceptionFilter,
    },
    {
      provide: APP_FILTER,
      useClass: ValidationExceptionFilter,
    },
  ],
})
export class AppModule {}
