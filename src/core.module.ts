import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AcceptLanguageResolver, I18nModule } from 'nestjs-i18n';
import * as path from 'path';
import envMapper from './common/config/env.mapper';
import { envSchema } from './common/config/env.schema';
import { EnvironmentVariables } from './common/config/env.types';
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      load: [envMapper],
      validationSchema: envSchema,
    }),

    I18nModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService<EnvironmentVariables>) => ({
        fallbackLanguage: configService.getOrThrow('fallbackLanguage', { infer: true }),
        loaderOptions: {
          path: path.join(__dirname, '/i18n/'),
          watch: true,
        },
      }),

      resolvers: [AcceptLanguageResolver],
    }),

    MongooseModule.forRootAsync({
      useFactory: (configService: ConfigService) => ({
        uri: configService.getOrThrow('MONGO_URI'),
      }),
      inject: [ConfigService],
    }),
  ],
})
export class CoreModule {}
