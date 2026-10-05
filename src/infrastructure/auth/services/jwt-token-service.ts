import type { TokenService } from '@application/auth/services/token.service';
import { ApplicationError } from '@common/errors/application.error';
import type { Logger } from '@common/logging/logger';
import { LOGGER } from '@common/logging/logger.token';
import { toError } from '@common/utils/to-error';
import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from '../../../common/interfaces/jwt-payload.interface';

@Injectable()
export class JwtTokenService implements TokenService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    @Inject(LOGGER)
    private readonly logger: Logger,
  ) {}

  async verifyAccessToken(token: string): Promise<JwtPayload> {
    return this.verifyToken(token, 'JWT_SECRET', 'access');
  }

  async verifyRefreshToken(token: string): Promise<JwtPayload> {
    return this.verifyToken(token, 'REFRESH_TOKEN_SECRET', 'refresh');
  }

  async generateAccessToken(payload: JwtPayload): Promise<string> {
    return this.jwtService.signAsync<{ id: string; role: string; type: string }>(
      { id: payload.id, role: payload.role, type: 'access' },
      {
        secret: this.configService.getOrThrow<string>('JWT_SECRET'),
        expiresIn: this.configService.getOrThrow<number>('ACCESS_TOKEN_EXPIRE_IN'),
      },
    );
  }

  async generateRefreshToken(payload: JwtPayload): Promise<string> {
    return this.jwtService.signAsync<{ id: string; role: string; type: string }>(
      { id: payload.id, role: payload.role, type: 'refresh' },
      {
        secret: this.configService.getOrThrow<string>('REFRESH_TOKEN_SECRET'),
        expiresIn: this.configService.getOrThrow<number>('REFRESH_TOKEN_EXPIRE_IN'),
      },
    );
  }

  private async verifyToken(
    token: string,
    secretKey: 'REFRESH_TOKEN_SECRET' | 'JWT_SECRET',
    expectedType: 'access' | 'refresh',
  ): Promise<JwtPayload> {
    try {
      const decodedToken = await this.jwtService.verifyAsync<JwtPayload & { type: string }>(token, {
        secret: this.configService.getOrThrow<string>(secretKey),
      });

      if (decodedToken.type !== expectedType) {
        throw new ApplicationError('INVALID_TOKEN');
      }

      return { id: decodedToken.id, role: decodedToken.role };
    } catch (error) {
      this.logger.error(toError(error), 'Invalid token');
      throw new ApplicationError('INVALID_TOKEN');
    }
  }
}
