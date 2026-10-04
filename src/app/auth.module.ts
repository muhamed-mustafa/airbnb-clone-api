import { REFRESH_TOKEN_REPOSITORY } from '@application/auth/repositories/refresh-token-repository.token';
import { AuthService } from '@application/auth/services/auth.service';
import { SECRET_HASH_SERVICE_TOKEN } from '@application/auth/services/secret-hash-service.token';
import { TOKEN_SERVICE_TOKEN } from '@application/auth/services/token-service.token';
import { GenerateTokenUseCase } from '@application/auth/use-cases/generate-token.usecase';
import { LoginUseCase } from '@application/auth/use-cases/login.usecase';
import { RefreshTokenUseCase } from '@application/auth/use-cases/refresh-token.usecase';
import { RegisterUseCase } from '@application/auth/use-cases/register.usecase';
import { EnvironmentVariables } from '@common/config/env.types';
import { MongooseRefreshTokenRepository } from '@infrastructure/auth/repositories/mongoose-refresh-token.repository';
import {
  RefreshToken,
  RefreshTokenSchema,
} from '@infrastructure/auth/schemas/refresh-token.schema';
import { Argon2SecretHashService } from '@infrastructure/auth/services/argon2-secret-hash.service';
import { JwtTokenService } from '@infrastructure/auth/services/jwt-token-service';
import { LoggingModule } from '@infrastructure/logging/logging.module';
import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthController } from '@presentation/auth/auth.controller';
import { JwtAuthGuard } from '../presentation/auth/guards/jwt-auth.guard';
import { RolesGuard } from '../presentation/auth/guards/roles.guard';
import { UsersModule } from './users.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: RefreshToken.name, schema: RefreshTokenSchema }]),
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
    { provide: REFRESH_TOKEN_REPOSITORY, useClass: MongooseRefreshTokenRepository },
    { provide: TOKEN_SERVICE_TOKEN, useClass: JwtTokenService },
    { provide: SECRET_HASH_SERVICE_TOKEN, useClass: Argon2SecretHashService },
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
  ],
  exports: [GenerateTokenUseCase],
})
export class AuthModule {}
