import { ApiNotFoundResponse } from '@nestjs/swagger';

const applicationErrorSchema = {
  type: 'object' as const,
  required: ['code', 'message'],
  properties: { code: { type: 'string' as const }, message: { type: 'string' as const } },
};

export const ApiAppSettingsNotFoundResponse = () =>
  ApiNotFoundResponse({
    description: 'The application settings have not been initialized yet.',
    schema: {
      ...applicationErrorSchema,
      example: { code: 'APP_SETTINGS_NOT_FOUND', message: 'Application settings not found.' },
    },
  });
