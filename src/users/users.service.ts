import { Inject, Injectable } from '@nestjs/common';
import { UserEntity } from './entities/user.entity';
import { CreateUserInput } from './inputs/create-user.input';
import { UserFilter } from './repositories/user-filter';
import { USER_REPOSITORY_TOKEN } from './repositories/user-repository.token';
import type { UserRepository } from './repositories/users.repository';

@Injectable()
export class UsersService {
  constructor(
    @Inject(USER_REPOSITORY_TOKEN)
    private readonly userRepository: UserRepository,
  ) {}

  async create(data: CreateUserInput): Promise<UserEntity> {
    return await this.userRepository.create(data);
  }
  findOne(filter: UserFilter): Promise<UserEntity | null> {
    return this.userRepository.findOne(filter);
  }
}
