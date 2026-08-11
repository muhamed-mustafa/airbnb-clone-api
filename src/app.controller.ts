import { Controller, Get } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { AppEnvironment } from './common/config/env.types';
import { AppService } from './app.service';
@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly configService: ConfigService<AppEnvironment>,
  ) {}

  @Get()
  getHello(): string {
    console.log(this.configService.getOrThrow('port', { infer: true }));
    return this.appService.getHello();
  }
}
