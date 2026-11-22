import type {
  CustomerActivationEmail,
  CustomerActivationEmailSender,
} from '@application/auth/services/customer-activation-email-sender';
import { EnvironmentVariables } from '@common/config/env.types';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { buildCustomerAuthCodeEmail } from './customer-auth-code-email.template';

@Injectable()
export class ResendCustomerActivationEmailSender implements CustomerActivationEmailSender {
  private readonly logger = new Logger(ResendCustomerActivationEmailSender.name);
  constructor(private readonly config: ConfigService<EnvironmentVariables>) {}
  isConfigured(): boolean {
    return Boolean(
      this.config.get<string>('RESEND_API_KEY') && this.config.get<string>('AUTH_EMAIL_FROM'),
    );
  }
  async send(email: CustomerActivationEmail): Promise<void> {
    const apiKey = this.config.get<string>('RESEND_API_KEY');
    const from = this.config.get<string>('AUTH_EMAIL_FROM');
    if (!apiKey || !from) return;
    const content = buildCustomerAuthCodeEmail('activation', email);
    try {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { authorization: `Bearer ${apiKey}`, 'content-type': 'application/json' },
        signal: AbortSignal.timeout(8_000),
        body: JSON.stringify({
          from: from.includes('<') ? from : `ULFA <${from}>`,
          to: [email.to],
          subject: content.subject,
          text: content.text,
          html: content.html,
        }),
      });
      if (!response.ok)
        this.logger.error(`Customer activation email delivery failed (${response.status}).`);
    } catch {
      this.logger.error('Customer activation email delivery failed.');
    }
  }
}
