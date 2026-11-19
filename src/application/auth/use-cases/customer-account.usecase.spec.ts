import type { UsersService } from '@application/users/services/users.service';
import type { RefreshTokenRepository } from '../repositories/refresh-token.repository';
import { ChangeMyPasswordUseCase } from './change-my-password.usecase';
import { LogoutUseCase } from './logout.usecase';

describe('customer account operations', () => {
  const user = {
    id: 'user-id',
    name: 'Test',
    email: 'test@example.com',
    phone: '+201000000000',
    password: 'old-hash',
  };
  const users = { findOne: jest.fn(), updatePassword: jest.fn() };
  const hashes = { verify: jest.fn(), hash: jest.fn() };
  const refreshTokens = { revoke: jest.fn() };
  const change = new ChangeMyPasswordUseCase(
    users as unknown as UsersService,
    hashes,
    refreshTokens as unknown as RefreshTokenRepository,
  );
  const logout = new LogoutUseCase(refreshTokens as unknown as RefreshTokenRepository);

  beforeEach(() => {
    jest.clearAllMocks();
    users.findOne.mockResolvedValue(user);
    users.updatePassword.mockResolvedValue(true);
    hashes.verify.mockResolvedValue(true);
    hashes.hash.mockResolvedValue('new-hash');
    refreshTokens.revoke.mockResolvedValue(undefined);
  });

  it('revokes the stored refresh session on logout', async () => {
    await logout.execute('user-id');
    expect(refreshTokens.revoke).toHaveBeenCalledWith('user-id');
  });

  it('rejects a wrong current password without changing the stored hash', async () => {
    hashes.verify.mockResolvedValue(false);
    await expect(change.execute('user-id', 'wrong', 'new-secret')).rejects.toMatchObject({
      code: 'INVALID_CREDENTIALS',
    });
    expect(users.updatePassword).not.toHaveBeenCalled();
    expect(refreshTokens.revoke).not.toHaveBeenCalled();
  });

  it('changes the hash and revokes refresh sessions after verification', async () => {
    await change.execute('user-id', 'old-secret', 'new-secret');
    expect(hashes.verify).toHaveBeenCalledWith('old-hash', 'old-secret');
    expect(users.updatePassword).toHaveBeenCalledWith('user-id', 'new-hash');
    expect(refreshTokens.revoke).toHaveBeenCalledWith('user-id');
  });
});
