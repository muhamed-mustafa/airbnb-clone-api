import type {
  AdminPasswordResetEmail,
  AdminPasswordResetEmailSender,
} from '@application/admin/services/admin-password-reset-email-sender';
import { EnvironmentVariables } from '@common/config/env.types';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { buildAdminPasswordResetEmail } from './admin-password-reset-email.template';

@Injectable()
export class ResendAdminPasswordResetEmailSender implements AdminPasswordResetEmailSender {
  private readonly logger = new Logger(ResendAdminPasswordResetEmailSender.name);

  constructor(private readonly config: ConfigService<EnvironmentVariables>) {}

  isConfigured(): boolean {
    return Boolean(
      this.config.get<string>('RESEND_API_KEY') && this.config.get<string>('AUTH_EMAIL_FROM'),
    );
  }

  async send(email: AdminPasswordResetEmail): Promise<void> {
    const apiKey = this.config.get<string>('RESEND_API_KEY');
    const from = this.config.get<string>('AUTH_EMAIL_FROM');
    if (!apiKey || !from) return;

    try {
      const content = buildAdminPasswordResetEmail(email);
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { authorization: `Bearer ${apiKey}`, 'content-type': 'application/json' },
        signal: AbortSignal.timeout(8_000),
        body: JSON.stringify({
          from: from.includes('<') ? from : `STAYS Security <${from}>`,
          to: [email.to],
          subject: content.subject,
          text: content.text,
          html: content.html,
        }),
      });

      if (!response.ok)
        this.logger.error(`Admin password reset email delivery failed (${response.status}).`);
    } catch {
      // Do not expose provider details or account state to the requester.
      this.logger.error('Admin password reset email delivery failed.');
    }
  }
}
