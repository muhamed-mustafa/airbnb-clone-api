import { AppSettingsEntity } from '@application/app-settings/entities/app-settings.entity';
import { UpsertAppSettingsInput } from '@application/app-settings/inputs/upsert-app-settings.input';
import { AppSettingsRepository } from '@application/app-settings/repositories/app-settings.repository';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AppSettingsMapper } from '../mappers/app-settings.mapper';
import { AppSettings } from '../schemas/app-settings.schema';

@Injectable()
export class MongooseAppSettingsRepository implements AppSettingsRepository {
  constructor(
    @InjectModel(AppSettings.name) private readonly appSettingsModel: Model<AppSettings>,
  ) {}

  async findOne(): Promise<AppSettingsEntity | null> {
    const appSettings = await this.appSettingsModel.findOne({}).exec();
    return appSettings ? AppSettingsMapper.toEntity(appSettings) : null;
  }

  async upsert(data: UpsertAppSettingsInput): Promise<AppSettingsEntity> {
    // Singleton: an empty filter always targets the one and only settings document,
    // creating it on the first upsert and updating it thereafter.
    const appSettings = await this.appSettingsModel
      .findOneAndUpdate(
        {},
        { $set: data },
        { upsert: true, returnDocument: 'after', runValidators: true, setDefaultsOnInsert: true },
      )
      .exec();

    return AppSettingsMapper.toEntity(appSettings);
  }
}
