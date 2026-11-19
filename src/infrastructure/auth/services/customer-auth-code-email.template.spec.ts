import { ConfigService } from '@nestjs/config';
import type { EnvironmentVariables } from '@common/config/env.types';
import { buildCustomerAuthCodeEmail } from './customer-auth-code-email.template';
import { ResendCustomerActivationEmailSender } from './resend-customer-activation-email-sender';
import { ResendCustomerPasswordResetEmailSender } from './resend-customer-password-reset-email-sender';

describe('customer auth code email', () => {
  it.each([
    ['activation', 'ar', 'أكّد بريدك الإلكتروني', 'rtl'],
    ['activation', 'en', 'Verify your email address', 'ltr'],
    ['password-reset', 'ar', 'استعد الوصول إلى حسابك', 'rtl'],
    ['password-reset', 'en', 'Get back into your account', 'ltr'],
  ] as const)('renders the %s email in %s', (purpose, language, title, direction) => {
    const content = buildCustomerAuthCodeEmail(purpose, {
      code: '123456',
      language,
      expiresInMinutes: 10,
    });

    expect(content.html).toContain(`<html lang="${language}" dir="${direction}">`);
    expect(content.html).toContain('<table role="presentation"');
    expect(content.html).toContain(title);
    expect(content.html).toContain('dir="ltr"');
    expect(content.html).toContain('123456');
    expect(content.html).toContain('10');
    expect(content.text).toContain('123456');
    expect(content.text).toContain('10');
  });

  it('escapes dynamic code in HTML', () => {
    const content = buildCustomerAuthCodeEmail('activation', {
      code: '<123456&>',
      language: 'en',
      expiresInMinutes: 10,
    });

    expect(content.html).toContain('&lt;123456&amp;&gt;');
    expect(content.html).not.toContain('<123456&>');
  });

  it.each(['activation', 'password-reset'] as const)(
    'sends the %s HTML and text through Resend',
    async (purpose) => {
      const config = {
        get: (key: string) =>
          ({ RESEND_API_KEY: 'test-key', AUTH_EMAIL_FROM: 'hello@example.com' })[key],
      } as unknown as ConfigService<EnvironmentVariables>;
      const sender =
        purpose === 'activation'
          ? new ResendCustomerActivationEmailSender(config)
          : new ResendCustomerPasswordResetEmailSender(config);
      const fetchMock = jest.spyOn(global, 'fetch').mockResolvedValue({ ok: true } as Response);

      try {
        await sender.send({
          to: 'guest@example.com',
          code: '123456',
          language: 'ar',
          expiresInMinutes: 10,
        });

        expect(fetchMock).toHaveBeenCalledTimes(1);
        const rawBody = fetchMock.mock.calls[0][1]?.body;
        expect(typeof rawBody).toBe('string');
        if (typeof rawBody !== 'string') throw new Error('Expected a JSON email payload');
        const body = JSON.parse(rawBody) as {
          html: string;
          text: string;
          subject: string;
        };
        expect(body.html).toContain('<html lang="ar" dir="rtl">');
        expect(body.html).toContain('123456');
        expect(body.text).toContain('123456');
        expect(body.subject).toContain('أُلفة');
      } finally {
        fetchMock.mockRestore();
      }
    },
  );
});
