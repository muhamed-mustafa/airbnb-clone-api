import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import * as argon2d from 'argon2';
import { Model } from 'mongoose';
import { EnvironmentVariables } from '../../common/config/env.types';
import { RefreshToken } from '../schemas/refresh-token.schema';

@Injectable()
export class GenerateTokenUseCase {
  constructor(
    @InjectModel(RefreshToken.name)
    private readonly refreshTokenModel: Model<RefreshToken>,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService<EnvironmentVariables>,
  ) {}

  async execute(id: string) {
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(
        { id, type: 'access' },
        {
          secret: this.configService.get('JWT_SECRET'),
          expiresIn: this.configService.get('ACCESS_TOKEN_EXPIRE_IN'),
        },
      ),
      this.jwtService.signAsync(
        { id, type: 'refresh' },
        {
          secret: this.configService.get('JWT_SECRET'),
          expiresIn: this.configService.get('REFRESH_TOKEN_EXPIRE_IN'),
        },
      ),
    ]);

    const hashedRefreshToken = await argon2d.hash(refreshToken);

    await this.refreshTokenModel.findOneAndUpdate(
      { userId: id },
      {
        userId: id,
        token: hashedRefreshToken,
      },
      { returnDocument: 'after', upsert: true },
    );

    return {
      accessToken,
      refreshToken,
    };
  }
}
