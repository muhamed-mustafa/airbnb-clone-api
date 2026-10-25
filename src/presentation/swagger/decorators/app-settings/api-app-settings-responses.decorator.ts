import { ApiNotFoundResponse } from '@nestjs/swagger';

import { errorsResponseSchema } from '../../error-response.schema';

export const ApiAppSettingsNotFoundResponse = () =>
  ApiNotFoundResponse({
    description: 'The application settings have not been initialized yet.',
    schema: {
      ...errorsResponseSchema(),
      example: {
        errors: [{ code: 'APP_SETTINGS_NOT_FOUND', message: 'Application settings not found.' }],
      },
    },
  });
