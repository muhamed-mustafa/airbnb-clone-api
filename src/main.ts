import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { I18nValidationPipe } from 'nestjs-i18n';
import { AppModule } from './app.module';
import type { EnvironmentVariables } from './common/config/env.types';
import { setupSwagger } from './common/presentation/swagger/swagger.setup';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const configService = app.get<ConfigService<EnvironmentVariables, true>>(ConfigService);

  const port = configService.getOrThrow('PORT', {
    infer: true,
  });

  app.useGlobalPipes(
    new I18nValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  setupSwagger(app);

  await app.listen(port);
}

void bootstrap();
