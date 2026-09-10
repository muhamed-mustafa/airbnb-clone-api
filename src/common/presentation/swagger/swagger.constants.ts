export const SWAGGER_PATH = 'docs';

export const SWAGGER_BEARER_AUTH = 'access-token';

export const SWAGGER_TAGS = {
  AUTH: 'Auth',
  USERS: 'Users',
} as const;

export const SWAGGER_API_TITLE = 'Airbnb Clone API';

export const SWAGGER_API_VERSION = '1.0.0';

export const SWAGGER_API_DESCRIPTION = `
REST API for the Airbnb Clone platform.

## Authentication

Most endpoints require a **Bearer JWT access token** obtained from \`POST /auth/register\`, \`POST /auth/login\`, or \`POST /auth/refresh-token\`.

Include the token in the \`Authorization\` header:

\`\`\`
Authorization: Bearer <accessToken>
\`\`\`

## Internationalization

Validation and error messages are localized via the \`Accept-Language\` header. Supported values: \`en\`, \`ar\`.

## Request Validation

- Unknown fields in request bodies are **rejected** with \`400 Bad Request\`.
- All string fields are trimmed unless otherwise noted.
- Email fields are normalized to lowercase.
`.trim();

export const SWAGGER_CONTACT = {
  name: 'Airbnb Clone API Support',
  email: 'muhammedmostafa.dev@gmail.com',
};

export const SWAGGER_LICENSE = {
  name: 'UNLICENSED',
};
