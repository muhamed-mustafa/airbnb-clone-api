import { AppSettingsEntity } from '../entities/app-settings.entity';
import { UpsertAppSettingsInput } from '../inputs/upsert-app-settings.input';

export interface AppSettingsRepository {
  findOne(): Promise<AppSettingsEntity | null>;
  upsert(data: UpsertAppSettingsInput): Promise<AppSettingsEntity>;
}
