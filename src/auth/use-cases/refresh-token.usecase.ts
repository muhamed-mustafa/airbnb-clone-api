import { Inject, Injectable } from '@nestjs/common';
import { RefreshTokenInput } from '../inputs/refresh-token.input';
import { RefreshTokenOutput } from '../outputs/refresh-token.output';
import { REFRESH_TOKEN_REPOSITORY } from '../repositories/refresh-token-repository.token';
import type { RefreshTokenRepository } from '../repositories/refresh-token.repository';
import { SECRET_HASH_SERVICE_TOKEN } from '../services/secret-hash-service.token';
import type { SecretHashService } from '../services/secret-hash.service';
import { TOKEN_SERVICE_TOKEN } from '../services/token-service.token';
import type { TokenService } from '../services/token.service';
import { GenerateTokenUseCase } from './generate-token.usecase';
import { ApplicationError } from '../../common/errors/application.error';

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
  ) {}

  async execute(body: RefreshTokenInput): Promise<RefreshTokenOutput> {
    const decodedToken = await this.tokenService.verify(body.token);

    if (decodedToken.type !== 'refresh') throw new ApplicationError('INVALID_TOKEN');

    const refreshToken = await this.refreshTokenRepository.findByUserId(decodedToken.id);

    if (!refreshToken) throw new ApplicationError('INVALID_TOKEN');

    const isValidRefreshToken = await this.secretHashService.verify(refreshToken.token, body.token);

    if (!isValidRefreshToken) throw new ApplicationError('INVALID_TOKEN');

    const { accessToken, refreshToken: newRefreshToken } = await this.generateToken.execute(
      decodedToken.id,
    );

    return { accessToken, refreshToken: newRefreshToken };
  }
}
