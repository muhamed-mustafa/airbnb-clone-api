import { Body, Controller, Post } from '@nestjs/common';
import { UserResponseDto } from './dtos/user-response.dto';
import type { CreateUserInput } from './inputs/create-user.input';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  async create(@Body() user: CreateUserInput): Promise<UserResponseDto> {
    return await this.usersService.create(user);
  }
}
