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
  ) {}

  async execute(): Promise<AppSettingsEntity> {
    const appSettings = await this.appSettingsRepository.findOne();

    if (!appSettings) {
      throw new ApplicationError('APP_SETTINGS_NOT_FOUND');
    }

    return appSettings;
  }
}
