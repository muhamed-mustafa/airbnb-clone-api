import { USER_REPOSITORY_TOKEN } from '@application/users/repositories/user-repository.token';
import type { UserRepository } from '@application/users/repositories/users.repository';
import { Roles } from '@common/enums/roles.enum';
import { ApplicationError } from '@common/errors/application.error';
import { Inject, Injectable } from '@nestjs/common';
import { createHmac, randomInt } from 'node:crypto';
import { CUSTOMER_ACTIVATION_EMAIL_SENDER } from '../services/customer-activation-email-sender.token';
import type { CustomerActivationEmailSender } from '../services/customer-activation-email-sender';
import { GenerateTokenUseCase } from './generate-token.usecase';

export const CUSTOMER_ACTIVATION_SECRET = Symbol('CUSTOMER_ACTIVATION_SECRET');

@Injectable()
export class CustomerActivationUseCase {
  constructor(
    @Inject(USER_REPOSITORY_TOKEN) private readonly users: UserRepository,
    @Inject(CUSTOMER_ACTIVATION_EMAIL_SENDER)
    private readonly emailSender: CustomerActivationEmailSender,
    @Inject(CUSTOMER_ACTIVATION_SECRET) private readonly secret: string,
    private readonly generateToken: GenerateTokenUseCase,
  ) {}

  assertConfigured(): void {
    if (!this.emailSender.isConfigured())
      throw new ApplicationError('CUSTOMER_ACTIVATION_EMAIL_UNAVAILABLE');
  }

  async issue(email: string, language: 'ar' | 'en' = 'ar'): Promise<void> {
    this.assertConfigured();
    const normalizedEmail = email.trim().toLowerCase();
    const code = randomInt(100000, 1000000).toString();
    const now = new Date();
    const issued = await this.users.issueActivationCode(
      normalizedEmail,
      this.digest(code),
      now,
      new Date(now.getTime() + 10 * 60_000),
    );
    if (issued) {
      await this.emailSender.send({ to: normalizedEmail, code, language, expiresInMinutes: 10 });
    }
  }

  async verify(
    email: string,
    code: string,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const normalizedEmail = email.trim().toLowerCase();
    const now = new Date();
    const userId = await this.users.activateEmail(normalizedEmail, this.digest(code), now);
    if (!userId) {
      await this.users.incrementActivationAttempts(normalizedEmail, now);
      throw new ApplicationError('CUSTOMER_ACTIVATION_CODE_INVALID');
    }
    return this.generateToken.execute({ id: userId, role: Roles.USER });
  }

  private digest(value: string): string {
    return createHmac('sha256', this.secret).update(`customer-activation:${value}`).digest('hex');
  }
}
