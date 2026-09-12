import { type INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SwaggerModule } from '@nestjs/swagger';
import type { EnvironmentVariables } from '../../config/env.types';
import { buildSwaggerDocument } from './swagger.config';
import { SWAGGER_API_TITLE, SWAGGER_PATH } from './swagger.constants';
import { SWAGGER_UI_CUSTOM_CSS } from './swagger-ui.css';
import { buildSwaggerUiCustomJs, SWAGGER_UI_FAVICON } from './swagger-ui.script';

export const setupSwagger = (app: INestApplication): void => {
  const configService = app.get<ConfigService<EnvironmentVariables, true>>(ConfigService);
  const runtimeEnvironment = process.env.NODE_ENV ?? 'development';

  const swaggerConfig = buildSwaggerDocument(configService);
  const document = SwaggerModule.createDocument(app, swaggerConfig);

  SwaggerModule.setup(SWAGGER_PATH, app, document, {
    customSiteTitle: SWAGGER_API_TITLE,
    customCss: SWAGGER_UI_CUSTOM_CSS,
    customJsStr: buildSwaggerUiCustomJs(runtimeEnvironment),
    customfavIcon: SWAGGER_UI_FAVICON,
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
