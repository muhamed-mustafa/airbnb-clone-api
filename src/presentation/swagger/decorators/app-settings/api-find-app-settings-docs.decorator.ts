import { applyDecorators } from '@nestjs/common';
import { ApiExtension, ApiOperation, ApiOkResponse } from '@nestjs/swagger';
import { AppSettingsResponseDto } from '@presentation/app-settings/dtos/app-settings-response.dto';

import { ApiInternalErrorResponse } from '../api-internal-error-response.decorator';
import { ApiAppSettingsNotFoundResponse } from './api-app-settings-responses.decorator';

export const ApiFindAppSettingsDocs = () =>
  applyDecorators(
    ApiExtension('x-docs-order', 10),
    ApiOperation({
      operationId: 'appSettingsFind',
      summary: 'Get application settings',
      description: 'Returns the singleton application settings document.',
    }),
    ApiOkResponse({ description: 'Application settings.', type: AppSettingsResponseDto }),
    ApiAppSettingsNotFoundResponse(),
    ApiInternalErrorResponse(),
  );
