import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import type { TokenService } from './token.service';
import { ApplicationError } from '../../common/errors/application.error';

@Injectable()
export class JwtTokenService implements TokenService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async verify(token: string): Promise<{ id: string; type: string }> {
    type DecodedToken = { id: string; type: string };

    let decodedToken: DecodedToken;

    try {
      decodedToken = await this.jwtService.verifyAsync<DecodedToken>(token, {
        secret: this.configService.getOrThrow<string>('JWT_SECRET'),
      });

      return decodedToken;
    } catch {
      throw new ApplicationError('INVALID_TOKEN');
    }
  }

  async generateAccessToken(userId: string): Promise<string> {
    return this.jwtService.signAsync<{ id: string; type: string }>(
      { id: userId, type: 'access' },
      {
        secret: this.configService.getOrThrow<string>('JWT_SECRET'),
        expiresIn: this.configService.getOrThrow<number>('ACCESS_TOKEN_EXPIRE_IN'),
      },
    );
  }

  async generateRefreshToken(userId: string): Promise<string> {
    return this.jwtService.signAsync<{ id: string; type: string }>(
      { id: userId, type: 'refresh' },
      {
        secret: this.configService.getOrThrow<string>('REFRESH_TOKEN_SECRET'),
        expiresIn: this.configService.getOrThrow<number>('REFRESH_TOKEN_EXPIRE_IN'),
      },
    );
  }
}
