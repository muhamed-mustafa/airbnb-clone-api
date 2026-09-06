import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { EnvironmentVariables } from '../common/config/env.types';
import { UsersModule } from '../users/users.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { MongooseRefreshTokenRepository } from './repositories/mongoose-refresh-token.repository';
import { REFRESH_TOKEN_REPOSITORY_TOKEN } from './repositories/refresh-token-repository.token';
import { RefreshToken, RefreshTokenSchema } from './schemas/refresh-token.schema';
import { JwtTokenService } from './services/jwt-token-service';
import { PasswordService } from './services/password.service';
import { TOKEN_SERVICE_TOKEN } from './services/token-service.token';
import { GenerateTokenUseCase } from './use-cases/generate-token.usecase';
import { LoginUseCase } from './use-cases/login.usecase';
import { RefreshTokenUseCase } from './use-cases/refresh-token.usecase';
import { RegisterUseCase } from './use-cases/register.usecase';

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
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    RegisterUseCase,
    LoginUseCase,
    RefreshTokenUseCase,
    GenerateTokenUseCase,
    PasswordService,
    { provide: REFRESH_TOKEN_REPOSITORY_TOKEN, useClass: MongooseRefreshTokenRepository },
    { provide: TOKEN_SERVICE_TOKEN, useClass: JwtTokenService },
  ],
  exports: [PasswordService],
})
export class AuthModule {}
