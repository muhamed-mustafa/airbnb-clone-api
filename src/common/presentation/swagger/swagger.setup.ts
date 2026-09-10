import { type INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SwaggerModule } from '@nestjs/swagger';
import type { EnvironmentVariables } from '../../config/env.types';
import { buildSwaggerDocument } from './swagger.config';
import { SWAGGER_API_TITLE, SWAGGER_PATH } from './swagger.constants';
import { SWAGGER_UI_CUSTOM_CSS } from './swagger-ui.css';

export const setupSwagger = (app: INestApplication): void => {
  const configService = app.get<ConfigService<EnvironmentVariables, true>>(ConfigService);

  const swaggerConfig = buildSwaggerDocument(configService);
  const document = SwaggerModule.createDocument(app, swaggerConfig);

  SwaggerModule.setup(SWAGGER_PATH, app, document, {
    customSiteTitle: SWAGGER_API_TITLE,
    customCss: SWAGGER_UI_CUSTOM_CSS,
    customfavIcon: 'https://nestjs.com/img/logo-small.svg',
    swaggerOptions: {
      persistAuthorization: true,
      deepLinking: true,
      docExpansion: 'none',
      filter: true,
      displayRequestDuration: true,
      tryItOutEnabled: true,
      syntaxHighlight: {
        activate: true,
        theme: 'monokai',
      },
      operationsSorter: 'alpha',
      tagsSorter: 'alpha',
    },
  });
};
