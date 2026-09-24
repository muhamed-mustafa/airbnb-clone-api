import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { APP_SETTINGS_REPOSITORY } from '@application/app-settings/repositories/app-settings-repository.token';
import { AppSettingsService } from '@application/app-settings/services/app-settings.service';
import { FindAppSettingsUseCase } from '@application/app-settings/use-cases/find-app-settings.usecase';
import { UpsertAppSettingsUseCase } from '@application/app-settings/use-cases/upsert-app-settings.usecase';
import { MongooseAppSettingsRepository } from '@infrastructure/app-settings/repositories/mongoose-app-settings.repository';
import {
  AppSettings,
  AppSettingsSchema,
} from '@infrastructure/app-settings/schemas/app-settings.schema';
import { AppSettingsController } from '@presentation/app-settings/app-settings.controller';

@Module({
  imports: [MongooseModule.forFeature([{ name: AppSettings.name, schema: AppSettingsSchema }])],
  controllers: [AppSettingsController],
  providers: [
    AppSettingsService,
    FindAppSettingsUseCase,
    UpsertAppSettingsUseCase,
    { provide: APP_SETTINGS_REPOSITORY, useClass: MongooseAppSettingsRepository },
  ],
  exports: [AppSettingsService],
})
export class AppSettingsModule {}
