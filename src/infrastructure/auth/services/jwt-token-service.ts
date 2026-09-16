import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { ApplicationError } from '@common/errors/application.error';
import type { Logger } from '@common/logging/logger';
import { LOGGER } from '@common/logging/logger.token';
import { toError } from '@common/utils/to-error';
import type { TokenService } from '@application/auth/services/token.service';

@Injectable()
export class JwtTokenService implements TokenService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    @Inject(LOGGER)
    private readonly logger: Logger,
  ) {}

  async verify(token: string): Promise<{ id: string; type: string }> {
    type DecodedToken = { id: string; type: string };

    let decodedToken: DecodedToken;

    try {
      decodedToken = await this.jwtService.verifyAsync<DecodedToken>(token, {
        secret: this.configService.getOrThrow<string>('REFRESH_TOKEN_SECRET'),
      });

      return decodedToken;
    } catch (err) {
      this.logger.error(toError(err), 'Invalid token');
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
