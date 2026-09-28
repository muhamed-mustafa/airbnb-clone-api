import type { Logger } from '@common/logging/logger';
import { LOGGER } from '@common/logging/logger.token';
import { Inject, Injectable } from '@nestjs/common';
import { ApplicationError } from '../../../common/errors/application.error';
import { AppSettingsEntity } from '../entities/app-settings.entity';
import { APP_SETTINGS_REPOSITORY } from '../repositories/app-settings-repository.token';
import type { AppSettingsRepository } from '../repositories/app-settings.repository';

@Injectable()
export class FindAppSettingsUseCase {
  constructor(
    @Inject(APP_SETTINGS_REPOSITORY)
    private readonly appSettingsRepository: AppSettingsRepository,
    @Inject(LOGGER)
    private readonly logger: Logger,
  ) {}

  async execute(): Promise<AppSettingsEntity> {
    const appSettings = await this.appSettingsRepository.findOne();

    if (!appSettings) {
      this.logger.debug('App settings not found');
      throw new ApplicationError('APP_SETTINGS_NOT_FOUND');
    }

    this.logger.debug('App settings retrieved');
    return appSettings;
  }
}
