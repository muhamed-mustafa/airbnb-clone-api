import { ApplicationError } from '@common/errors/application.error';
import type { Logger } from '@common/logging/logger';
import { LOGGER } from '@common/logging/logger.token';
import { Inject, Injectable } from '@nestjs/common';
import { JwtPayload } from '../../../common/interfaces/jwt-payload.interface';
import { REFRESH_TOKEN_REPOSITORY } from '../repositories/refresh-token-repository.token';
import type { RefreshTokenRepository } from '../repositories/refresh-token.repository';
import { SECRET_HASH_SERVICE_TOKEN } from '../services/secret-hash-service.token';
import type { SecretHashService } from '../services/secret-hash.service';
import { TOKEN_SERVICE_TOKEN } from '../services/token-service.token';
import type { TokenService } from '../services/token.service';

@Injectable()
export class GenerateTokenUseCase {
  constructor(
    @Inject(REFRESH_TOKEN_REPOSITORY)
    private readonly refreshTokenRepository: RefreshTokenRepository,
    @Inject(TOKEN_SERVICE_TOKEN)
    private readonly tokenService: TokenService,
    @Inject(SECRET_HASH_SERVICE_TOKEN)
    private readonly secretHashService: SecretHashService,
    @Inject(LOGGER)
    private readonly logger: Logger,
  ) {}

  async execute(payload: JwtPayload) {
    const [accessToken, refreshToken] = await Promise.all([
      this.tokenService.generateAccessToken(payload),
      this.tokenService.generateRefreshToken(payload),
    ]);

    const hashedRefreshToken = await this.secretHashService.hash(refreshToken);

    await this.refreshTokenRepository.save(payload.id, hashedRefreshToken);

    this.logger.info('Tokens generated', { userId: payload.id, roles: payload.role });

    return {
      accessToken,
      refreshToken,
    };
  }

  async rotate(payload: JwtPayload, oldTokenHash: string) {
    const [accessToken, refreshToken] = await Promise.all([
      this.tokenService.generateAccessToken(payload),
      this.tokenService.generateRefreshToken(payload),
    ]);

    const hashedRefreshToken = await this.secretHashService.hash(refreshToken);

    const rotated = await this.refreshTokenRepository.rotate(
      payload.id,
      oldTokenHash,
      hashedRefreshToken,
    );

    if (!rotated) {
      this.logger.warn('Token rotation failed', { id: payload.id, roles: payload.role });
      throw new ApplicationError('INVALID_TOKEN');
    }

    this.logger.info('Tokens rotated', { id: payload.id, roles: payload.role });

    return {
      accessToken,
      refreshToken,
    };
  }
}
