import { Body, Controller, Get, Put } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AppSettingsService } from '../../application/app-settings/services/app-settings.service';
import { ApiFindAppSettingsDocs } from '../swagger/decorators/app-settings/api-find-app-settings-docs.decorator';
import { ApiUpsertAppSettingsDocs } from '../swagger/decorators/app-settings/api-upsert-app-settings-docs.decorator';
import { SWAGGER_TAGS } from '../swagger/swagger.constants';
import { AppSettingsResponseDto } from './dtos/app-settings-response.dto';
import { UpsertAppSettingsDto } from './dtos/upsert-app-settings.dto';
import { AppSettingsMapper } from './mappers/app-settings.mapper';

@ApiTags(SWAGGER_TAGS.APP_SETTINGS)
@Controller('app-settings')
export class AppSettingsController {
  constructor(private readonly appSettingsService: AppSettingsService) {}

  @Get()
  @ApiFindAppSettingsDocs()
  async findOne(): Promise<AppSettingsResponseDto> {
    const output = await this.appSettingsService.findOne();
    return AppSettingsMapper.toResponse(output);
  }

  @Put()
  @ApiUpsertAppSettingsDocs()
  async upsert(@Body() body: UpsertAppSettingsDto): Promise<AppSettingsResponseDto> {
    const input = AppSettingsMapper.toUpsertInput(body);
    const output = await this.appSettingsService.upsert(input);
    return AppSettingsMapper.toResponse(output);
  }
}
