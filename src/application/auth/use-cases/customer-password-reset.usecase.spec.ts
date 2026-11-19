import type { UserRepository } from '@application/users/repositories/users.repository';
import type { RefreshTokenRepository } from '../repositories/refresh-token.repository';
import type { CustomerPasswordResetEmail } from '../services/customer-password-reset-email-sender';
import { CustomerPasswordResetUseCase } from './customer-password-reset.usecase';

describe('CustomerPasswordResetUseCase', () => {
  const users = {
    issuePasswordResetCode: jest.fn(),
    incrementPasswordResetAttempts: jest.fn(),
    verifyPasswordResetCode: jest.fn(),
    hasValidPasswordResetToken: jest.fn(),
    resetPassword: jest.fn(),
  };
  const hashes = { hash: jest.fn(), verify: jest.fn() };
  const sender = {
    isConfigured: jest.fn(),
    send: jest.fn<Promise<void>, [CustomerPasswordResetEmail]>(),
  };
  const refreshTokens = { revoke: jest.fn() };
  const useCase = new CustomerPasswordResetUseCase(
    users as unknown as UserRepository,
    hashes,
    sender,
    'test-customer-reset-secret-32-characters',
    refreshTokens as unknown as RefreshTokenRepository,
  );

  beforeEach(() => {
    jest.clearAllMocks();
    sender.isConfigured.mockReturnValue(true);
    sender.send.mockResolvedValue(undefined);
    users.incrementPasswordResetAttempts.mockResolvedValue(undefined);
    refreshTokens.revoke.mockResolvedValue(undefined);
  });

  it('requires configured email delivery before issuing a code', async () => {
    sender.isConfigured.mockReturnValue(false);
    await expect(useCase.request('guest@example.com')).rejects.toMatchObject({
      code: 'CUSTOMER_PASSWORD_RESET_EMAIL_UNAVAILABLE',
    });
    expect(users.issuePasswordResetCode).not.toHaveBeenCalled();
  });

  it('sends a six-digit code only for an existing eligible account and keeps the public response generic', async () => {
    users.issuePasswordResetCode.mockResolvedValueOnce(true).mockResolvedValueOnce(false);
    await useCase.request(' GUEST@Example.com ', 'ar');
    expect(users.issuePasswordResetCode).toHaveBeenCalledWith(
      'guest@example.com',
      expect.stringMatching(/^[a-f0-9]{64}$/),
      expect.any(Date),
      expect.any(Date),
    );
    expect(sender.send.mock.calls[0]?.[0]).toEqual(
      expect.objectContaining({ to: 'guest@example.com', language: 'ar' }),
    );
    expect(sender.send.mock.calls[0]?.[0].code).toMatch(/^\d{6}$/);
    await useCase.request('unknown@example.com');
    expect(sender.send).toHaveBeenCalledTimes(1);
  });

  it('limits invalid codes and consumes a valid code into a short-lived reset session', async () => {
    users.verifyPasswordResetCode.mockResolvedValueOnce(false).mockResolvedValueOnce(true);
    await expect(useCase.verify('guest@example.com', '000000')).rejects.toMatchObject({
      code: 'CUSTOMER_PASSWORD_RESET_CODE_INVALID',
    });
    expect(users.incrementPasswordResetAttempts).toHaveBeenCalledTimes(1);
    const { resetToken } = await useCase.verify('guest@example.com', '123456');
    expect(resetToken).toHaveLength(43);
    expect(users.verifyPasswordResetCode).toHaveBeenCalledWith(
      'guest@example.com',
      expect.stringMatching(/^[a-f0-9]{64}$/),
      expect.any(Date),
      expect.stringMatching(/^[a-f0-9]{64}$/),
      expect.any(Date),
    );
  });

  it('updates the password only with a valid token and revokes the refresh session', async () => {
    users.hasValidPasswordResetToken.mockResolvedValue(true);
    users.resetPassword.mockResolvedValueOnce('guest-id').mockResolvedValueOnce(null);
    hashes.hash.mockResolvedValue('argon-hash');
    const token = 'a'.repeat(43);
    await useCase.complete(token, 'new-password-123');
    expect(users.resetPassword).toHaveBeenCalledWith(
      expect.stringMatching(/^[a-f0-9]{64}$/),
      'argon-hash',
      expect.any(Date),
    );
    expect(refreshTokens.revoke).toHaveBeenCalledWith('guest-id');
    await expect(useCase.complete(token, 'new-password-123')).rejects.toMatchObject({
      code: 'CUSTOMER_PASSWORD_RESET_SESSION_INVALID',
    });
    expect(refreshTokens.revoke).toHaveBeenCalledTimes(1);
  });
});
