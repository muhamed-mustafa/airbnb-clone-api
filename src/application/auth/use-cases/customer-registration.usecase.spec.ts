import type { UsersService } from '@application/users/services/users.service';
import type { CustomerActivationUseCase } from './customer-activation.usecase';
import type { GenerateTokenUseCase } from './generate-token.usecase';
import { LoginUseCase } from './login.usecase';
import { RegisterUseCase } from './register.usecase';

describe('customer registration and login', () => {
  const users = { create: jest.fn(), findOne: jest.fn() };
  const activation = { assertConfigured: jest.fn(), issue: jest.fn() };
  const hashes = { hash: jest.fn(), verify: jest.fn() };
  const tokens = { execute: jest.fn() };
  const logger = { info: jest.fn(), warn: jest.fn(), error: jest.fn(), debug: jest.fn() };
  const register = new RegisterUseCase(
    users as unknown as UsersService,
    activation as unknown as CustomerActivationUseCase,
    hashes,
    logger,
  );
  const login = new LoginUseCase(
    users as unknown as UsersService,
    tokens as unknown as GenerateTokenUseCase,
    hashes,
    logger,
  );
  const user = {
    id: 'guest-id',
    name: 'Guest',
    email: 'guest@example.com',
    phone: '+201555738344',
    password: 'hashed-password',
    emailVerifiedAt: null,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    users.create.mockResolvedValue(user);
    users.findOne.mockResolvedValue(user);
    hashes.hash.mockResolvedValue('hashed-password');
    hashes.verify.mockResolvedValue(true);
    activation.issue.mockResolvedValue(undefined);
    tokens.execute.mockResolvedValue({ accessToken: 'access', refreshToken: 'refresh' });
  });

  it('creates a pending account and never issues tokens during registration', async () => {
    await expect(
      register.execute({
        name: 'Guest',
        email: 'guest@example.com',
        countryCode: '+20',
        phone: '1555738344',
        password: 'password-123',
        language: 'en',
      }),
    ).resolves.toEqual({ email: 'guest@example.com', verificationRequired: true });
    expect(users.create).toHaveBeenCalledWith(expect.objectContaining({ emailVerifiedAt: null }));
    expect(activation.issue).toHaveBeenCalledWith('guest@example.com', 'en');
    expect(tokens.execute).not.toHaveBeenCalled();
  });

  it('rejects a pending account and permits verified and legacy accounts', async () => {
    await expect(
      login.execute({ email: user.email, password: 'password-123' }),
    ).rejects.toMatchObject({
      code: 'CUSTOMER_EMAIL_NOT_VERIFIED',
    });
    expect(tokens.execute).not.toHaveBeenCalled();

    users.findOne.mockResolvedValueOnce({ ...user, emailVerifiedAt: new Date() });
    await expect(login.execute({ email: user.email, password: 'password-123' })).resolves.toEqual({
      accessToken: 'access',
      refreshToken: 'refresh',
    });
    users.findOne.mockResolvedValueOnce({ ...user, emailVerifiedAt: undefined });
    await expect(login.execute({ email: user.email, password: 'password-123' })).resolves.toEqual({
      accessToken: 'access',
      refreshToken: 'refresh',
    });
    expect(tokens.execute).toHaveBeenCalledTimes(2);
  });
});
