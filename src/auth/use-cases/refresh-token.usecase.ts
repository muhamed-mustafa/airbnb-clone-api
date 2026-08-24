import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import * as argon2d from 'argon2';
import { plainToInstance } from 'class-transformer';
import { Model } from 'mongoose';
import { I18nService } from 'nestjs-i18n';
import { EnvironmentVariables } from '../../common/config/env.types';
import { AuthResponseDto } from '../dtos/auth-response.dto';
import { RefreshTokenDto } from '../dtos/refresh-token.dto';
import { RefreshToken } from '../schemas/refresh-token.schema';
import { GenerateTokenUseCase } from './generate-token.usecase';

@Injectable()
export class RefreshTokenUseCase {
  constructor(
    @InjectModel(RefreshToken.name)
    private readonly refreshTokenModel: Model<RefreshToken>,
    private readonly JwtService: JwtService,
    private readonly configService: ConfigService<EnvironmentVariables>,
    private readonly i18nService: I18nService,
    private readonly generateToken: GenerateTokenUseCase,
  ) {}

  async execute(body: RefreshTokenDto): Promise<AuthResponseDto> {
    type DecodedToken = { id: string; type: string };

    let decodedToken: DecodedToken;

    try {
      decodedToken = await this.JwtService.verifyAsync<DecodedToken>(body.token, {
        secret: this.configService.getOrThrow<string>('JWT_SECRET'),
      });
    } catch {
      throw new UnauthorizedException(this.i18nService.translate('auth.INVALID_TOKEN'));
    }

    if (decodedToken.type !== 'refresh')
      throw new UnauthorizedException(this.i18nService.translate('auth.INVALID_TOKEN'));

    const refreshToken = await this.refreshTokenModel.findOne({ userId: decodedToken.id });

    if (!refreshToken)
      throw new NotFoundException(this.i18nService.translate('auth.INVALID_TOKEN'));

    const isValidRefreshToken = await argon2d.verify(refreshToken.token, body.token);

    if (!isValidRefreshToken)
      throw new NotFoundException(this.i18nService.translate('auth.INVALID_TOKEN'));

    const { accessToken, refreshToken: newRefreshToken } = await this.generateToken.execute(
      decodedToken.id?.toString(),
    );

    return plainToInstance(AuthResponseDto, { accessToken, refreshToken: newRefreshToken });
  }
}
