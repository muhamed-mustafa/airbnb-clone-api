import type { TokenService } from '@application/auth/services/token.service';
import { ApplicationError } from '@common/errors/application.error';
import type { Logger } from '@common/logging/logger';
import { LOGGER } from '@common/logging/logger.token';
import { toError } from '@common/utils/to-error';
import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { ROLES } from '../../../common/constants/roles.constant';
import { JwtPayload } from '../../../common/interfaces/jwt-payload.interface';

@Injectable()
export class JwtTokenService implements TokenService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    @Inject(LOGGER)
    private readonly logger: Logger,
  ) {}

  async verify(token: string): Promise<{ payload: JwtPayload; type: string }> {
    type DecodedToken = { payload: { id: string; role: string }; type: string };

    let decodedToken: DecodedToken;

    try {
      decodedToken = await this.jwtService.verifyAsync<DecodedToken>(token, {
        secret: this.configService.getOrThrow<string>('REFRESH_TOKEN_SECRET'),
      });

      return {
        payload: {
          id: decodedToken.payload.id,
          role: decodedToken.payload.role as ROLES,
        },
        type: decodedToken.type,
      };
    } catch (err) {
      this.logger.error(toError(err), 'Invalid token');
      throw new ApplicationError('INVALID_TOKEN');
    }
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
}
