import { Injectable } from '@nestjs/common';
import { AppSettingsEntity } from '../entities/app-settings.entity';
import { UpsertAppSettingsInput } from '../inputs/upsert-app-settings.input';
import { FindAppSettingsUseCase } from '../use-cases/find-app-settings.usecase';
import { UpsertAppSettingsUseCase } from '../use-cases/upsert-app-settings.usecase';

@Injectable()
export class AppSettingsService {
  constructor(
    private readonly findAppSettingsUseCase: FindAppSettingsUseCase,
    private readonly upsertAppSettingsUseCase: UpsertAppSettingsUseCase,
  ) {}

  async findOne(): Promise<AppSettingsEntity> {
    return await this.findAppSettingsUseCase.execute();
  }

  async upsert(data: UpsertAppSettingsInput): Promise<AppSettingsEntity> {
    return await this.upsertAppSettingsUseCase.execute(data);
  }
}
