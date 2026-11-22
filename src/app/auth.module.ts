import { REFRESH_TOKEN_REPOSITORY } from '@application/auth/repositories/refresh-token-repository.token';
import { AuthService } from '@application/auth/services/auth.service';
import { SECRET_HASH_SERVICE_TOKEN } from '@application/auth/services/secret-hash-service.token';
import { TOKEN_SERVICE_TOKEN } from '@application/auth/services/token-service.token';
import { GenerateTokenUseCase } from '@application/auth/use-cases/generate-token.usecase';
import { LogoutUseCase } from '@application/auth/use-cases/logout.usecase';
import { ChangeMyPasswordUseCase } from '@application/auth/use-cases/change-my-password.usecase';
import {
  CustomerPasswordResetUseCase,
  CUSTOMER_PASSWORD_RESET_SECRET,
} from '@application/auth/use-cases/customer-password-reset.usecase';
import { CUSTOMER_PASSWORD_RESET_EMAIL_SENDER } from '@application/auth/services/customer-password-reset-email-sender.token';
import { ResendCustomerPasswordResetEmailSender } from '@infrastructure/auth/services/resend-customer-password-reset-email-sender';
import {
  CustomerActivationUseCase,
  CUSTOMER_ACTIVATION_SECRET,
} from '@application/auth/use-cases/customer-activation.usecase';
import { CUSTOMER_ACTIVATION_EMAIL_SENDER } from '@application/auth/services/customer-activation-email-sender.token';
import { ResendCustomerActivationEmailSender } from '@infrastructure/auth/services/resend-customer-activation-email-sender';
import { LoginUseCase } from '@application/auth/use-cases/login.usecase';
import { RefreshTokenUseCase } from '@application/auth/use-cases/refresh-token.usecase';
import { RegisterUseCase } from '@application/auth/use-cases/register.usecase';
import { EnvironmentVariables } from '@common/config/env.types';
import { MongooseRefreshTokenRepository } from '@infrastructure/auth/repositories/mongoose-refresh-token.repository';
import { RefreshTokenSchema } from '@infrastructure/auth/schemas/refresh-token.schema';
import { Argon2SecretHashService } from '@infrastructure/auth/services/argon2-secret-hash.service';
import { JwtTokenService } from '@infrastructure/auth/services/jwt-token-service';
import { LoggingModule } from '@infrastructure/logging/logging.module';
import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthController } from '@presentation/auth/auth.controller';
import { JwtAuthGuard } from '@presentation/auth/guards/jwt-auth.guard';
import { RolesGuard } from '@presentation/auth/guards/roles.guard';
import { UsersModule } from './users.module';
import { modelNames } from '@common/constants/model-names.constant';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: modelNames.REFRESH_TOKENS, schema: RefreshTokenSchema }]),
    UsersModule,
    JwtModule.registerAsync({
      useFactory: (configService: ConfigService<EnvironmentVariables>) => ({
        secret: configService.getOrThrow('JWT_SECRET'),
        signOptions: { expiresIn: configService.getOrThrow('ACCESS_TOKEN_EXPIRE_IN') },
      }),
      inject: [ConfigService],
    }),
    LoggingModule,
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    RegisterUseCase,
    LoginUseCase,
    RefreshTokenUseCase,
    GenerateTokenUseCase,
    LogoutUseCase,
    ChangeMyPasswordUseCase,
    CustomerPasswordResetUseCase,
    CustomerActivationUseCase,
    { provide: CUSTOMER_ACTIVATION_EMAIL_SENDER, useClass: ResendCustomerActivationEmailSender },
    {
      provide: CUSTOMER_ACTIVATION_SECRET,
      useFactory: (config: ConfigService<EnvironmentVariables>) =>
        config.getOrThrow<string>('ADMIN_PASSWORD_RESET_SECRET'),
      inject: [ConfigService],
    },
    {
      provide: CUSTOMER_PASSWORD_RESET_EMAIL_SENDER,
      useClass: ResendCustomerPasswordResetEmailSender,
    },
    {
      provide: CUSTOMER_PASSWORD_RESET_SECRET,
      useFactory: (config: ConfigService<EnvironmentVariables>) =>
        config.getOrThrow<string>('ADMIN_PASSWORD_RESET_SECRET'),
      inject: [ConfigService],
    },
    { provide: REFRESH_TOKEN_REPOSITORY, useClass: MongooseRefreshTokenRepository },
    { provide: TOKEN_SERVICE_TOKEN, useClass: JwtTokenService },
    { provide: SECRET_HASH_SERVICE_TOKEN, useClass: Argon2SecretHashService },
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
  ],
  exports: [GenerateTokenUseCase, REFRESH_TOKEN_REPOSITORY],
})
export class AuthModule {}
