import type { UserRepository } from '@application/users/repositories/users.repository';
import type { CustomerActivationEmail } from '../services/customer-activation-email-sender';
import type { GenerateTokenUseCase } from './generate-token.usecase';
import { CustomerActivationUseCase } from './customer-activation.usecase';

describe('CustomerActivationUseCase', () => {
  const users = {
    issueActivationCode: jest.fn(),
    incrementActivationAttempts: jest.fn(),
    activateEmail: jest.fn(),
  };
  const sender = {
    isConfigured: jest.fn(),
    send: jest.fn<Promise<void>, [CustomerActivationEmail]>(),
  };
  const tokens = { accessToken: 'access', refreshToken: 'refresh' };
  const generateToken = { execute: jest.fn() };
  const useCase = new CustomerActivationUseCase(
    users as unknown as UserRepository,
    sender,
    'test-activation-secret-32-characters',
    generateToken as unknown as GenerateTokenUseCase,
  );

  beforeEach(() => {
    jest.clearAllMocks();
    sender.isConfigured.mockReturnValue(true);
    sender.send.mockResolvedValue(undefined);
    users.incrementActivationAttempts.mockResolvedValue(undefined);
    generateToken.execute.mockResolvedValue(tokens);
  });

  it('refuses to issue a code without configured email delivery', async () => {
    sender.isConfigured.mockReturnValue(false);
    await expect(useCase.issue('guest@example.com')).rejects.toMatchObject({
      code: 'CUSTOMER_ACTIVATION_EMAIL_UNAVAILABLE',
    });
    expect(users.issueActivationCode).not.toHaveBeenCalled();
  });

  it('sends a six-digit code only for an eligible pending account', async () => {
    users.issueActivationCode.mockResolvedValueOnce(true).mockResolvedValueOnce(false);
    await useCase.issue(' GUEST@Example.com ', 'en');
    expect(users.issueActivationCode).toHaveBeenCalledWith(
      'guest@example.com',
      expect.stringMatching(/^[a-f0-9]{64}$/),
      expect.any(Date),
      expect.any(Date),
    );
    expect(sender.send.mock.calls[0]?.[0]).toEqual(
      expect.objectContaining({ to: 'guest@example.com', language: 'en' }),
    );
    expect(sender.send.mock.calls[0]?.[0].code).toMatch(/^\d{6}$/);
    await useCase.issue('unknown@example.com');
    expect(sender.send).toHaveBeenCalledTimes(1);
  });

  it('counts invalid codes and only issues a session after atomic activation', async () => {
    users.activateEmail.mockResolvedValueOnce(null).mockResolvedValueOnce('guest-id');
    await expect(useCase.verify('guest@example.com', '000000')).rejects.toMatchObject({
      code: 'CUSTOMER_ACTIVATION_CODE_INVALID',
    });
    expect(users.incrementActivationAttempts).toHaveBeenCalledWith(
      'guest@example.com',
      expect.any(Date),
    );
    expect(generateToken.execute).not.toHaveBeenCalled();

    await expect(useCase.verify(' GUEST@Example.com ', '123456')).resolves.toEqual(tokens);
    expect(users.activateEmail).toHaveBeenCalledWith(
      'guest@example.com',
      expect.stringMatching(/^[a-f0-9]{64}$/),
      expect.any(Date),
    );
    expect(generateToken.execute).toHaveBeenCalledWith({ id: 'guest-id', role: 'user' });
  });
});
