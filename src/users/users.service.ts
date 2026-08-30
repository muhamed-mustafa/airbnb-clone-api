import { Inject, Injectable } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { UserResponseDto } from './dtos/user-response.dto';
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

  async create(data: CreateUserInput): Promise<UserResponseDto> {
    const user = await this.userRepository.create(data);
    return plainToInstance(UserResponseDto, user);
  }
  findOne(filter: UserFilter): Promise<UserEntity | null> {
    return this.userRepository.findOne(filter);
  }
}
