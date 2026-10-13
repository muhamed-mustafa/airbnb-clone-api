import type { Logger } from '@common/logging/logger';
import { LOGGER } from '@common/logging/logger.token';
import { Inject, Injectable } from '@nestjs/common';
import { UserEntity } from '../entities/user.entity';
import { CreateUserInput } from '../inputs/create-user.input';
import { UserFilter } from '../repositories/user-filter';
import { USER_REPOSITORY_TOKEN } from '../repositories/user-repository.token';
import type { UserRepository } from '../repositories/users.repository';

@Injectable()
export class UsersService {
  constructor(
    @Inject(USER_REPOSITORY_TOKEN)
    private readonly userRepository: UserRepository,
    @Inject(LOGGER) private readonly logger: Logger,
  ) {}

  async create(data: CreateUserInput): Promise<UserEntity> {
    const user = await this.userRepository.create(data);
    this.logger.info('User created', { userId: user.id });
    return user;
  }
  async findOne(filter: UserFilter): Promise<UserEntity | null> {
    const user = await this.userRepository.findOne(filter);
    this.logger.debug(user ? 'User retrieved' : 'User not found', {
      ...(user && { userId: user.id }),
    });
    return user;
  }
}
