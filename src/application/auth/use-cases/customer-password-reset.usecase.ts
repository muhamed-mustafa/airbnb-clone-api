import { REFRESH_TOKEN_REPOSITORY } from '@application/auth/repositories/refresh-token-repository.token';
import type { RefreshTokenRepository } from '@application/auth/repositories/refresh-token.repository';
import { SECRET_HASH_SERVICE_TOKEN } from '@application/auth/services/secret-hash-service.token';
import type { SecretHashService } from '@application/auth/services/secret-hash.service';
import { USER_REPOSITORY_TOKEN } from '@application/users/repositories/user-repository.token';
import type { UserRepository } from '@application/users/repositories/users.repository';
import { ApplicationError } from '@common/errors/application.error';
import { Inject, Injectable } from '@nestjs/common';
import { createHmac, randomBytes, randomInt } from 'node:crypto';
import { CUSTOMER_PASSWORD_RESET_EMAIL_SENDER } from '../services/customer-password-reset-email-sender.token';
import type { CustomerPasswordResetEmailSender } from '../services/customer-password-reset-email-sender';

export const CUSTOMER_PASSWORD_RESET_SECRET = Symbol('CUSTOMER_PASSWORD_RESET_SECRET');

@Injectable()
export class CustomerPasswordResetUseCase {
  constructor(
    @Inject(USER_REPOSITORY_TOKEN) private readonly users: UserRepository,
    @Inject(SECRET_HASH_SERVICE_TOKEN) private readonly hashes: SecretHashService,
    @Inject(CUSTOMER_PASSWORD_RESET_EMAIL_SENDER)
    private readonly emailSender: CustomerPasswordResetEmailSender,
    @Inject(CUSTOMER_PASSWORD_RESET_SECRET) private readonly secret: string,
    @Inject(REFRESH_TOKEN_REPOSITORY) private readonly refreshTokens: RefreshTokenRepository,
  ) {}

  async request(email: string, language: 'ar' | 'en' = 'ar'): Promise<void> {
    if (!this.emailSender.isConfigured())
      throw new ApplicationError('CUSTOMER_PASSWORD_RESET_EMAIL_UNAVAILABLE');
    const normalizedEmail = email.trim().toLowerCase();
    const code = randomInt(100000, 1000000).toString();
    const now = new Date();
    const issued = await this.users.issuePasswordResetCode(
      normalizedEmail,
      this.digest(code),
      now,
      new Date(now.getTime() + 10 * 60_000),
    );
    if (issued)
      void this.emailSender.send({ to: normalizedEmail, code, language, expiresInMinutes: 10 });
    // Unknown addresses and cooldown requests have the same public response.
    await new Promise((resolve) => setTimeout(resolve, 250));
  }

  async verify(email: string, code: string): Promise<{ resetToken: string }> {
    const normalizedEmail = email.trim().toLowerCase();
    const now = new Date();
    const resetToken = randomBytes(32).toString('base64url');
    const valid = await this.users.verifyPasswordResetCode(
      normalizedEmail,
      this.digest(code),
      now,
      this.digest(resetToken),
      new Date(now.getTime() + 10 * 60_000),
    );
    if (!valid) {
      await this.users.incrementPasswordResetAttempts(normalizedEmail, now);
      throw new ApplicationError('CUSTOMER_PASSWORD_RESET_CODE_INVALID');
    }
    return { resetToken };
  }

  async complete(resetToken: string, newPassword: string): Promise<void> {
    if (resetToken.length !== 43)
      throw new ApplicationError('CUSTOMER_PASSWORD_RESET_SESSION_INVALID');
    const tokenHash = this.digest(resetToken);
    const now = new Date();
    if (!(await this.users.hasValidPasswordResetToken(tokenHash, now)))
      throw new ApplicationError('CUSTOMER_PASSWORD_RESET_SESSION_INVALID');
    const passwordHash = await this.hashes.hash(newPassword);
    const userId = await this.users.resetPassword(tokenHash, passwordHash, now);
    if (!userId) throw new ApplicationError('CUSTOMER_PASSWORD_RESET_SESSION_INVALID');
    await this.refreshTokens.revoke(userId);
  }

  private digest(value: string): string {
    return createHmac('sha256', this.secret)
      .update(`customer-password-reset:${value}`)
      .digest('hex');
  }
}
