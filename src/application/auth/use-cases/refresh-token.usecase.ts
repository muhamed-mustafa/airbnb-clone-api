import type { Logger } from '@common/logging/logger';
import { LOGGER } from '@common/logging/logger.token';
import { Inject, Injectable } from '@nestjs/common';
import { ApplicationError } from '@common/errors/application.error';
import { RefreshTokenInput } from '../inputs/refresh-token.input';
import { RefreshTokenOutput } from '../outputs/refresh-token.output';
import { REFRESH_TOKEN_REPOSITORY } from '../repositories/refresh-token-repository.token';
import type { RefreshTokenRepository } from '../repositories/refresh-token.repository';
import { SECRET_HASH_SERVICE_TOKEN } from '../services/secret-hash-service.token';
import type { SecretHashService } from '../services/secret-hash.service';
import { TOKEN_SERVICE_TOKEN } from '../services/token-service.token';
import type { TokenService } from '../services/token.service';
import { GenerateTokenUseCase } from './generate-token.usecase';

@Injectable()
export class RefreshTokenUseCase {
  constructor(
    @Inject(REFRESH_TOKEN_REPOSITORY)
    private readonly refreshTokenRepository: RefreshTokenRepository,
    @Inject(TOKEN_SERVICE_TOKEN)
    private readonly tokenService: TokenService,
    private readonly generateToken: GenerateTokenUseCase,
    @Inject(SECRET_HASH_SERVICE_TOKEN)
    private readonly secretHashService: SecretHashService,
    @Inject(LOGGER)
    private readonly logger: Logger,
  ) {}

  async execute(body: RefreshTokenInput): Promise<RefreshTokenOutput> {
    const decodedToken = await this.tokenService.verify(body.token);

    if (decodedToken.type !== 'refresh') {
      this.logger.warn('Refresh token rejected: invalid token');
      throw new ApplicationError('INVALID_TOKEN');
    }

    const refreshToken = await this.refreshTokenRepository.findByUserId(decodedToken.id);

    if (!refreshToken) {
      this.logger.warn('Refresh token rejected: invalid token');
      throw new ApplicationError('INVALID_TOKEN');
    }

    const isValidRefreshToken = await this.secretHashService.verify(refreshToken.token, body.token);

    if (!isValidRefreshToken) {
      this.logger.warn('Refresh token rejected: invalid token');
      throw new ApplicationError('INVALID_TOKEN');
    }

    const { accessToken, refreshToken: newRefreshToken } = await this.generateToken.rotate(
      decodedToken.id,
      refreshToken.token,
    );

    this.logger.info('Refresh token rotated', { userId: decodedToken.id });

    return { accessToken, refreshToken: newRefreshToken };
  }
}
