import { ApplicationError } from '@common/errors/application.error';
import type { AdminRepository } from '../repositories/admin.repository';
import type { AdminPasswordResetEmailSender } from '../services/admin-password-reset-email-sender';
import type { SecretHashService } from '../../auth/services/secret-hash.service';
import type { RefreshTokenRepository } from '../../auth/repositories/refresh-token.repository';
import { AdminPasswordResetUseCase } from './admin-password-reset.usecase';

describe('AdminPasswordResetUseCase', () => {
  const repository = {
    issuePasswordResetCode: jest.fn(),
    incrementPasswordResetAttempts: jest.fn(),
    verifyPasswordResetCode: jest.fn(),
    hasValidPasswordResetToken: jest.fn(),
    resetPassword: jest.fn(),
  } as unknown as jest.Mocked<AdminRepository>;
  const emailSender = {
    isConfigured: jest.fn(),
    send: jest.fn(),
  } as jest.Mocked<AdminPasswordResetEmailSender>;
  const hashService = {
    hash: jest.fn(),
    verify: jest.fn(),
  } as jest.Mocked<SecretHashService>;
  const revokeRefreshToken: jest.MockedFunction<RefreshTokenRepository['revoke']> = jest.fn();
  const refreshTokenRepository = {
    findByUserId: jest.fn(),
    save: jest.fn(),
    rotate: jest.fn(),
    revoke: revokeRefreshToken,
  } as jest.Mocked<RefreshTokenRepository>;
  const useCase = new AdminPasswordResetUseCase(
    repository,
    hashService,
    emailSender,
    'test-secret',
    { codeTtlMinutes: 7, resetTokenTtlMinutes: 4 },
    refreshTokenRepository,
  );

  beforeEach(() => jest.clearAllMocks());

  it('keeps reset disabled until email delivery is configured', async () => {
    emailSender.isConfigured.mockReturnValue(false);

    await expect(useCase.request('admin@example.com')).rejects.toMatchObject({
      code: 'ADMIN_PASSWORD_RESET_EMAIL_UNAVAILABLE',
    } satisfies Partial<ApplicationError>);
    expect(repository.issuePasswordResetCode.mock.calls).toHaveLength(0);
  });

  it('issues a code only when the admin is eligible and verifies it once', async () => {
    emailSender.isConfigured.mockReturnValue(true);
    repository.issuePasswordResetCode.mockResolvedValue(true);
    repository.verifyPasswordResetCode.mockResolvedValue(true);

    await useCase.request('ADMIN@example.com');
    const [email, codeHash] = repository.issuePasswordResetCode.mock.calls[0];
    expect(email).toBe('admin@example.com');
    expect(codeHash).toMatch(/^[a-f0-9]{64}$/);
    const [emailSendInput] = emailSender.send.mock.calls[0];
    expect(emailSendInput.to).toBe('admin@example.com');
    expect(emailSendInput.code).toMatch(/^\d{6}$/);
    expect(emailSendInput.expiresInMinutes).toBe(7);
    expect(emailSendInput.language).toBe('en');

    const result = await useCase.verify(emailSendInput.to, emailSendInput.code);
    expect(result.resetToken).toHaveLength(43);
    const verifyCall = repository.verifyPasswordResetCode.mock.calls[0];
    expect(verifyCall[0]).toBe(email);
    expect(verifyCall[1]).toBe(codeHash);
    expect(verifyCall[2]).toBeInstanceOf(Date);
    expect(verifyCall[3]).toMatch(/^[a-f0-9]{64}$/);
    expect(verifyCall[4]).toBeInstanceOf(Date);
    expect(verifyCall[4].getTime() - verifyCall[2].getTime()).toBe(4 * 60_000);
    const issueCall = repository.issuePasswordResetCode.mock.calls[0];
    expect(issueCall[3].getTime() - issueCall[2].getTime()).toBe(7 * 60_000);
  });

  it('counts invalid code attempts and does not proceed', async () => {
    repository.verifyPasswordResetCode.mockResolvedValue(false);

    await expect(useCase.verify('admin@example.com', '000000')).rejects.toMatchObject({
      code: 'ADMIN_PASSWORD_RESET_CODE_INVALID',
    } satisfies Partial<ApplicationError>);
    expect(repository.incrementPasswordResetAttempts.mock.calls[0][0]).toBe('admin@example.com');
    expect(repository.incrementPasswordResetAttempts.mock.calls[0][1]).toBeInstanceOf(Date);
  });

  it('changes the password only with a valid, expiring reset token', async () => {
    repository.hasValidPasswordResetToken.mockResolvedValue(true);
    hashService.hash.mockResolvedValue('argon-hash');
    repository.resetPassword.mockResolvedValue('admin-id');

    await useCase.complete('x'.repeat(43), 'new-password');
    const resetCall = repository.resetPassword.mock.calls[0];
    expect(resetCall[0]).toMatch(/^[a-f0-9]{64}$/);
    expect(resetCall[1]).toBe('argon-hash');
    expect(resetCall[2]).toBeInstanceOf(Date);
    expect(revokeRefreshToken.mock.calls).toEqual([['admin-id']]);
  });
});
