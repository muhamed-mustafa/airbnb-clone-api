import type { Logger } from '@common/logging/logger';
import { LOGGER } from '@common/logging/logger.token';
import { Inject, Injectable } from '@nestjs/common';
import { AppSettingsEntity } from '../entities/app-settings.entity';
import { UpsertAppSettingsInput } from '../inputs/upsert-app-settings.input';
import { APP_SETTINGS_REPOSITORY } from '../repositories/app-settings-repository.token';
import type { AppSettingsRepository } from '../repositories/app-settings.repository';

@Injectable()
export class UpsertAppSettingsUseCase {
  constructor(
    @Inject(APP_SETTINGS_REPOSITORY)
    private readonly appSettingsRepository: AppSettingsRepository,
    @Inject(LOGGER)
    private readonly logger: Logger,
  ) {}

  async execute(data: UpsertAppSettingsInput): Promise<AppSettingsEntity> {
    const appSettings = await this.appSettingsRepository.upsert(data);
    this.logger.info('App settings updated');
    return appSettings;
  }
}
