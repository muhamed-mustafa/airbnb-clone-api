import { REFRESH_TOKEN_REPOSITORY } from '../repositories/refresh-token-repository.token';
import type { RefreshTokenRepository } from '../repositories/refresh-token.repository';
import { Inject, Injectable } from '@nestjs/common';

@Injectable()
export class LogoutUseCase {
  constructor(
    @Inject(REFRESH_TOKEN_REPOSITORY) private readonly refreshTokens: RefreshTokenRepository,
  ) {}

  async execute(userId: string): Promise<void> {
    await this.refreshTokens.revoke(userId);
  }
}
