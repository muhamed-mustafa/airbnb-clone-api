import { Test, TestingModule } from '@nestjs/testing';
import { LOGGER } from '@common/logging/logger.token';
import type { UserRepository } from '../repositories/users.repository';
import { USER_REPOSITORY_TOKEN } from '../repositories/user-repository.token';
import { UsersService } from './users.service';

describe('UsersService', () => {
  let service: UsersService;
  let logger: { debug: jest.Mock; info: jest.Mock; warn: jest.Mock; error: jest.Mock };
  let repository: jest.Mocked<UserRepository>;
  beforeEach(async () => {
    logger = { debug: jest.fn(), info: jest.fn(), warn: jest.fn(), error: jest.fn() };
    repository = { create: jest.fn(), findOne: jest.fn() };
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: USER_REPOSITORY_TOKEN, useValue: repository },
        { provide: LOGGER, useValue: logger },
      ],
    }).compile();
    service = module.get<UsersService>(UsersService);
  });
  it('resolves both repository and logger dependencies', () => expect(service).toBeDefined());
  it('logs a created user by ID without recording account input or hash', async () => {
    const data = {
      name: 'Synthetic user',
      email: 'synthetic@example.com',
      phone: '+201234567890',
      password: 'synthetic-secret-hash',
    };
    const user = { id: 'user-test', ...data };
    repository.create.mockResolvedValue(user);
    expect(await service.create(data)).toBe(user);
    expect(logger.info).toHaveBeenCalledWith('User created', { userId: user.id });
    const logged = JSON.stringify(logger.info.mock.calls);
    expect(logged).not.toContain(data.password);
    expect(logged).not.toContain(data.email);
    expect(logged).not.toContain(data.phone);
  });
  it('does not log success when persistence fails', async () => {
    repository.create.mockRejectedValue(new Error('database unavailable'));
    await expect(
      service.create({
        name: 'Test',
        email: 'synthetic@example.com',
        phone: 'test',
        password: 'secret',
      }),
    ).rejects.toThrow('database unavailable');
    expect(logger.info).not.toHaveBeenCalled();
  });
  it('does not log search filters for a missing user', async () => {
    repository.findOne.mockResolvedValue(null);
    expect(await service.findOne({ email: 'synthetic@example.com' })).toBeNull();
    expect(logger.debug).toHaveBeenCalledWith('User not found', {});
  });
});
