import type { AppSettingsEntity } from '../../../application/app-settings/entities/app-settings.entity';
import type { UpsertAppSettingsInput } from '../../../application/app-settings/inputs/upsert-app-settings.input';
import { AppSettingsResponseDto } from '../dtos/app-settings-response.dto';
import { UpsertAppSettingsDto } from '../dtos/upsert-app-settings.dto';

export class AppSettingsMapper {
  static toUpsertInput(appSettings: UpsertAppSettingsDto): UpsertAppSettingsInput {
    return {
      vatRate: appSettings.vatRate,
      minPrice: appSettings.minPrice,
    };
  }

  static toResponse(appSettings: AppSettingsEntity): AppSettingsResponseDto {
    return {
      vatRate: appSettings.vatRate,
      minPrice: appSettings.minPrice,
    };
  }
}
