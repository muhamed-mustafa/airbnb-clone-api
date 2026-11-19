export const SWAGGER_PATH = 'docs';

export const SWAGGER_BEARER_AUTH = 'access-token';

export const SWAGGER_TAG_GROUPS = {
  ADMIN: 'Admin',
} as const;

export const SWAGGER_TAGS = {
  AUTH: 'Authentication',
  USERS: 'Users',
  UNITS: 'Units',
  COUNTRIES: `${SWAGGER_TAG_GROUPS.ADMIN} / Countries`,
  CITIES: `${SWAGGER_TAG_GROUPS.ADMIN} / Cities`,
  CURRENCIES: `${SWAGGER_TAG_GROUPS.ADMIN} / Currencies`,
  UNIT_CATEGORIES: `${SWAGGER_TAG_GROUPS.ADMIN} / Unit Categories`,
  APP_SETTINGS: `${SWAGGER_TAG_GROUPS.ADMIN} / App Settings`,
  ADMINS: `${SWAGGER_TAG_GROUPS.ADMIN} / Admins`,
  FILES: 'Files',
  BOOKINGS: 'Bookings',
} as const;

export const SWAGGER_ACCEPTED_LANGUAGES = [
  { label: 'English', value: 'en' },
  { label: 'Arabic', value: 'ar' },
] as const;

export const SWAGGER_API_TITLE = 'Airbnb Clone API';

export const SWAGGER_API_VERSION = '1.0.0';

export const SWAGGER_API_DESCRIPTION = `
REST API for the Airbnb Clone platform.

## Authentication

For a new customer, use **Register**, **Verify customer activation**, then **Refresh Token**. An existing active customer can use **Login**. Registration does not return tokens.

When an operation returns tokens, Swagger captures them automatically. The **access token** is reused through the native Bearer authorization flow, and the **refresh token** is reused for the refresh-token request flow.

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
