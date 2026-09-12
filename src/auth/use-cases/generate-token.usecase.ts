import { Inject, Injectable } from '@nestjs/common';
import { REFRESH_TOKEN_REPOSITORY } from '../repositories/refresh-token-repository.token';
import type { RefreshTokenRepository } from '../repositories/refresh-token.repository';
import { SECRET_HASH_SERVICE_TOKEN } from '../services/secret-hash-service.token';
import type { SecretHashService } from '../services/secret-hash.service';
import { TOKEN_SERVICE_TOKEN } from '../services/token-service.token';
import type { TokenService } from '../services/token.service';
import { ApplicationError } from '../../common/errors/application.error';

@Injectable()
export class GenerateTokenUseCase {
  constructor(
    @Inject(REFRESH_TOKEN_REPOSITORY)
    private readonly refreshTokenRepository: RefreshTokenRepository,
    @Inject(TOKEN_SERVICE_TOKEN)
    private readonly tokenService: TokenService,
    @Inject(SECRET_HASH_SERVICE_TOKEN)
    private readonly secretHashService: SecretHashService,
  ) {}

  async execute(id: string) {
    const [accessToken, refreshToken] = await Promise.all([
      this.tokenService.generateAccessToken(id),
      this.tokenService.generateRefreshToken(id),
    ]);

    const hashedRefreshToken = await this.secretHashService.hash(refreshToken);

    await this.refreshTokenRepository.save(id, hashedRefreshToken);

    return {
      accessToken,
      refreshToken,
    };
  }

  async rotate(id: string, oldTokenHash: string) {
    const [accessToken, refreshToken] = await Promise.all([
      this.tokenService.generateAccessToken(id),
      this.tokenService.generateRefreshToken(id),
    ]);

    const hashedRefreshToken = await this.secretHashService.hash(refreshToken);

    const rotated = await this.refreshTokenRepository.rotate(id, oldTokenHash, hashedRefreshToken);

    if (!rotated) {
      throw new ApplicationError('INVALID_TOKEN');
    }

    return {
      accessToken,
      refreshToken,
    };
  }
}
