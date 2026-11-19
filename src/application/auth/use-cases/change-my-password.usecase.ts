import { UsersService } from '@application/users/services/users.service';
import { ApplicationError } from '@common/errors/application.error';
import { Inject, Injectable } from '@nestjs/common';
import { REFRESH_TOKEN_REPOSITORY } from '../repositories/refresh-token-repository.token';
import type { RefreshTokenRepository } from '../repositories/refresh-token.repository';
import { SECRET_HASH_SERVICE_TOKEN } from '../services/secret-hash-service.token';
import type { SecretHashService } from '../services/secret-hash.service';

@Injectable()
export class ChangeMyPasswordUseCase {
  constructor(
    private readonly users: UsersService,
    @Inject(SECRET_HASH_SERVICE_TOKEN) private readonly hashes: SecretHashService,
    @Inject(REFRESH_TOKEN_REPOSITORY) private readonly refreshTokens: RefreshTokenRepository,
  ) {}

  async execute(userId: string, currentPassword: string, newPassword: string): Promise<void> {
    const user = await this.users.findOne({ id: userId });
    if (!user || !(await this.hashes.verify(user.password, currentPassword)))
      throw new ApplicationError('INVALID_CREDENTIALS');
    const hash = await this.hashes.hash(newPassword);
    if (!(await this.users.updatePassword(userId, hash)))
      throw new ApplicationError('INVALID_TOKEN');
    await this.refreshTokens.revoke(userId);
  }
}
