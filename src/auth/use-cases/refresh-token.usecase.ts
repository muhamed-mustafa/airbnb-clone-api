import { Inject, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { I18nService } from 'nestjs-i18n';
import { RefreshTokenInput } from '../inputs/refresh-token.input';
import { RefreshTokenOutput } from '../outputs/refresh-token.output';
import { REFRESH_TOKEN_REPOSITORY_TOKEN } from '../repositories/refresh-token-repository.token';
import type { RefreshTokenRepository } from '../repositories/refresh-token.repository';
import { PasswordService } from '../services/password.service';
import { TOKEN_SERVICE_TOKEN } from '../services/token-service.token';
import type { TokenService } from '../services/token.service';
import { GenerateTokenUseCase } from './generate-token.usecase';

@Injectable()
export class RefreshTokenUseCase {
  constructor(
    @Inject(REFRESH_TOKEN_REPOSITORY_TOKEN)
    private readonly refreshTokenRepository: RefreshTokenRepository,
    @Inject(TOKEN_SERVICE_TOKEN)
    private readonly tokenService: TokenService,
    private readonly i18nService: I18nService,
    private readonly generateToken: GenerateTokenUseCase,
    private readonly passwordService: PasswordService,
  ) {}

  async execute(body: RefreshTokenInput): Promise<RefreshTokenOutput> {
    const decodedToken = await this.tokenService.verify(body.token);

    if (decodedToken.type !== 'refresh')
      throw new UnauthorizedException(this.i18nService.translate('auth.INVALID_TOKEN'));

    const refreshToken = await this.refreshTokenRepository.findByUserId(decodedToken.id);

    if (!refreshToken)
      throw new NotFoundException(this.i18nService.translate('auth.INVALID_TOKEN'));

    const isValidRefreshToken = await this.passwordService.verify(refreshToken.token, body.token);

    if (!isValidRefreshToken)
      throw new NotFoundException(this.i18nService.translate('auth.INVALID_TOKEN'));

    const { accessToken, refreshToken: newRefreshToken } = await this.generateToken.execute(
      decodedToken.id,
    );

    return { accessToken, refreshToken: newRefreshToken };
  }
}
