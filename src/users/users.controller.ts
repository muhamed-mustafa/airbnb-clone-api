import { Body, Controller, Post } from '@nestjs/common';
import { UserResponseDto } from './dtos/user-response.dto';
import type { CreateUserInput } from './inputs/create-user.input';
import { UserMapper } from './mappers/user.mapper';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  async create(@Body() data: CreateUserInput): Promise<UserResponseDto> {
    const user = await this.usersService.create(data);
    return UserMapper.toResponse(user);
  }
}
