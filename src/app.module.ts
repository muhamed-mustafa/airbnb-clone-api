import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import envMapper from 'src/common/config/env.mapper';
import { envSchema } from 'src/common/config/env.schema';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      load: [envMapper],
      validationSchema: envSchema,
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
