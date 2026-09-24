import { applyDecorators } from '@nestjs/common';
import { ApiExtension, ApiOperation, ApiBody, ApiOkResponse } from '@nestjs/swagger';
import { AppSettingsResponseDto } from '@presentation/app-settings/dtos/app-settings-response.dto';
import { UpsertAppSettingsDto } from '@presentation/app-settings/dtos/upsert-app-settings.dto';
import { ApiInternalErrorResponse } from '../api-internal-error-response.decorator';
import { ApiValidationErrorResponse } from '../api-validation-error-response.decorator';

export const ApiUpsertAppSettingsDocs = () =>
  applyDecorators(
    ApiExtension('x-docs-order', 20),
    ApiOperation({
      operationId: 'appSettingsUpsert',
      summary: 'Upsert application settings',
      description:
        'Creates the singleton application settings document on first call, or updates the ' +
        'supplied fields thereafter. Only the provided fields are changed.',
    }),
    ApiBody({ type: UpsertAppSettingsDto }),
    ApiOkResponse({
      description: 'Application settings after the upsert.',
      type: AppSettingsResponseDto,
    }),
    ApiValidationErrorResponse({
      outOfRange: {
        summary: 'Value out of allowed range',
        value: {
          errors: [
            {
              code: 'max',
              field: 'vatRate',
              message: 'vatRate must not be greater than 25',
            },
          ],
        },
      },
    }),
    ApiInternalErrorResponse(),
  );
