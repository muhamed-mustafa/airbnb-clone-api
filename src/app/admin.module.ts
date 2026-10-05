import { ADMIN_REPOSITORY } from '@application/admin/repositories/admin-repository.token';
import { AdminService } from '@application/admin/services/admin.service';
import { FindAllAdminsUseCase } from '@application/admin/use-cases/find-all-admins.usecase';
import { FindOneAdminUseCase } from '@application/admin/use-cases/find-one-admin.usecase';
import { INITIALIZE_ADMIN_INPUT } from '@application/admin/use-cases/initialize-admin-input.token';
import {
  InitializeAdminUseCase,
  type InitializeAdminInput,
} from '@application/admin/use-cases/initialize-admin.usecase';
import { LoginAdminUseCase } from '@application/admin/use-cases/login-admin.usecase';
import { SECRET_HASH_SERVICE_TOKEN } from '@application/auth/services/secret-hash-service.token';
import { EnvironmentVariables } from '@common/config/env.types';
import { Admin, AdminSchema } from '@infrastructure/admin/schemas/admin.schema';
import { MongooseAdminRepository } from '@infrastructure/admin/schemas/repositories/mongoose-admin.repository';
import { Argon2SecretHashService } from '@infrastructure/auth/services/argon2-secret-hash.service';
import { LoggingModule } from '@infrastructure/logging/logging.module';
import { Module, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AdminAuthController } from '@presentation/admin/admin-auth.controller';
import { AdminController } from '@presentation/admin/admin.controller';
import { AuthModule } from './auth.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Admin.name, schema: AdminSchema }]),
    LoggingModule,
    AuthModule,
  ],
  controllers: [AdminController, AdminAuthController],
  providers: [
    AdminService,
    FindAllAdminsUseCase,
    FindOneAdminUseCase,
    InitializeAdminUseCase,
    LoginAdminUseCase,
    {
      provide: INITIALIZE_ADMIN_INPUT,
      useFactory: (configService: ConfigService<EnvironmentVariables>): InitializeAdminInput => ({
        name: configService.getOrThrow('INITIAL_ADMIN_NAME'),
        email: configService.getOrThrow('INITIAL_ADMIN_EMAIL'),
        password: configService.getOrThrow('INITIAL_ADMIN_PASSWORD'),
      }),
      inject: [ConfigService],
    },
    { provide: ADMIN_REPOSITORY, useClass: MongooseAdminRepository },
    { provide: SECRET_HASH_SERVICE_TOKEN, useClass: Argon2SecretHashService },
  ],
  exports: [AdminService],
})
export class AdminModule implements OnModuleInit {
  constructor(private readonly initializeAdminUseCase: InitializeAdminUseCase) {}

  async onModuleInit() {
    await this.initializeAdminUseCase.execute();
  }
}
