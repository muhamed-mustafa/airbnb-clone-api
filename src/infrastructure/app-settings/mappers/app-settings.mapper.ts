import type { HydratedDocument } from 'mongoose';
import type { AppSettingsEntity } from '../../../application/app-settings/entities/app-settings.entity';
import type { AppSettings } from '../schemas/app-settings.schema';

export class AppSettingsMapper {
  static toEntity(appSettings: HydratedDocument<AppSettings>): AppSettingsEntity {
    return {
      vatRate: appSettings.vatRate,
      minPrice: appSettings.minPrice,
    };
  }
}
