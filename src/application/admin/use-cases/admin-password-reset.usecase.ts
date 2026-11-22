import { SECRET_HASH_SERVICE_TOKEN } from '@application/auth/services/secret-hash-service.token';
import type { SecretHashService } from '@application/auth/services/secret-hash.service';
import { ApplicationError } from '@common/errors/application.error';
import { Inject, Injectable } from '@nestjs/common';
import { createHmac, randomBytes, randomInt } from 'node:crypto';
import { REFRESH_TOKEN_REPOSITORY } from '../../auth/repositories/refresh-token-repository.token';
import type { RefreshTokenRepository } from '../../auth/repositories/refresh-token.repository';
import { ADMIN_REPOSITORY } from '../repositories/admin-repository.token';
import type { AdminRepository } from '../repositories/admin.repository';
import type {
  AdminPasswordResetEmailLanguage,
  AdminPasswordResetEmailSender,
} from '../services/admin-password-reset-email-sender';
import { ADMIN_PASSWORD_RESET_EMAIL_SENDER } from '../services/admin-password-reset-email-sender.token';
import {
  ADMIN_PASSWORD_RESET_OPTIONS,
  type AdminPasswordResetOptions,
} from './admin-password-reset-options.token';
import { ADMIN_PASSWORD_RESET_SECRET } from './admin-password-reset-secret.token';

@Injectable()
export class AdminPasswordResetUseCase {
  constructor(
    @Inject(ADMIN_REPOSITORY) private readonly adminRepository: AdminRepository,
    @Inject(SECRET_HASH_SERVICE_TOKEN) private readonly hashService: SecretHashService,
    @Inject(ADMIN_PASSWORD_RESET_EMAIL_SENDER)
    private readonly emailSender: AdminPasswordResetEmailSender,
    @Inject(ADMIN_PASSWORD_RESET_SECRET) private readonly secret: string,
    @Inject(ADMIN_PASSWORD_RESET_OPTIONS)
    private readonly resetOptions: AdminPasswordResetOptions,
    @Inject(REFRESH_TOKEN_REPOSITORY)
    private readonly refreshTokenRepository: RefreshTokenRepository,
  ) {}

  async request(email: string, language: AdminPasswordResetEmailLanguage = 'en'): Promise<void> {
    if (!this.emailSender.isConfigured())
      throw new ApplicationError('ADMIN_PASSWORD_RESET_EMAIL_UNAVAILABLE');

    const normalizedEmail = email.trim().toLowerCase();
    const code = randomInt(100000, 1000000).toString();
    const now = new Date();
    const expiresAt = new Date(now.getTime() + this.resetOptions.codeTtlMinutes * 60_000);

    const issued = await this.adminRepository.issuePasswordResetCode(
      normalizedEmail,
      this.digest(code),
      now,
      expiresAt,
    );

    if (issued) {
      void this.emailSender.send({
        to: normalizedEmail,
        code,
        expiresInMinutes: this.resetOptions.codeTtlMinutes,
        language,
      });
    }
    // Keep unknown addresses and throttled requests close to the same response time.
    await new Promise((resolve) => setTimeout(resolve, 250));
  }

  async verify(email: string, code: string): Promise<{ resetToken: string }> {
    const normalizedEmail = email.trim().toLowerCase();
    const now = new Date();
    const resetToken = randomBytes(32).toString('base64url');

    const verified = await this.adminRepository.verifyPasswordResetCode(
      normalizedEmail,
      this.digest(code),
      now,
      this.digest(resetToken),
      new Date(now.getTime() + this.resetOptions.resetTokenTtlMinutes * 60_000),
    );

    if (!verified) {
      await this.adminRepository.incrementPasswordResetAttempts(normalizedEmail, now);
      throw new ApplicationError('ADMIN_PASSWORD_RESET_CODE_INVALID');
    }

    return { resetToken };
  }

  async complete(resetToken: string, newPassword: string): Promise<void> {
    if (resetToken.length !== 43)
      throw new ApplicationError('ADMIN_PASSWORD_RESET_SESSION_INVALID');

    const tokenHash = this.digest(resetToken);
    const now = new Date();

    const tokenExists = await this.adminRepository.hasValidPasswordResetToken(tokenHash, now);
    if (!tokenExists) throw new ApplicationError('ADMIN_PASSWORD_RESET_SESSION_INVALID');

    const passwordHash = await this.hashService.hash(newPassword);
    const updated = await this.adminRepository.resetPassword(tokenHash, passwordHash, now);

    if (!updated) throw new ApplicationError('ADMIN_PASSWORD_RESET_SESSION_INVALID');
    await this.refreshTokenRepository.revoke(updated);
  }

  private digest(value: string): string {
    return createHmac('sha256', this.secret).update(value).digest('hex');
  }
}
