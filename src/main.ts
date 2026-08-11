import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import type { AppEnvironment } from './common/config/env.types';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const configService = app.get<ConfigService<AppEnvironment>>(ConfigService);

  const port = configService.getOrThrow('port', { infer: true });

  await app.listen(port);
}

void bootstrap();
