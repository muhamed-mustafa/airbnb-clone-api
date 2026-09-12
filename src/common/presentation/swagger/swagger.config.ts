import type { ConfigService } from '@nestjs/config';
import { DocumentBuilder } from '@nestjs/swagger';
import type { EnvironmentVariables } from '../../config/env.types';
import {
  SWAGGER_API_DESCRIPTION,
  SWAGGER_API_TITLE,
  SWAGGER_API_VERSION,
  SWAGGER_BEARER_AUTH,
  SWAGGER_CONTACT,
  SWAGGER_LICENSE,
  SWAGGER_TAGS,
} from './swagger.constants';

export const buildSwaggerDocument = (configService: ConfigService<EnvironmentVariables, true>) => {
  const port = configService.getOrThrow('PORT', { infer: true });
  const apiBaseUrl = process.env.API_BASE_URL;

  const builder = new DocumentBuilder()
    .setTitle(SWAGGER_API_TITLE)
    .setDescription(SWAGGER_API_DESCRIPTION)
    .setVersion(SWAGGER_API_VERSION)
    .setContact(SWAGGER_CONTACT.name, '', SWAGGER_CONTACT.email)
    .setLicense(SWAGGER_LICENSE.name, '')
    .addServer(`http://localhost:${port}`, 'Local development')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'Authorization',
        description:
          'JWT access token obtained from register, login, or refresh-token endpoints. Example: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`',
        in: 'header',
      },
      SWAGGER_BEARER_AUTH,
    )
    .addTag(SWAGGER_TAGS.AUTH, 'User authentication — registration, login, and token refresh.')
    .addTag(SWAGGER_TAGS.USERS, 'User account management.');

  if (apiBaseUrl) {
    builder.addServer(apiBaseUrl, 'Production');
  }

  return builder.build();
};
