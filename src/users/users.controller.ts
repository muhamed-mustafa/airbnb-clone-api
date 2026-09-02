import { Body, Controller, Post } from '@nestjs/common';
import { CreateUserDto } from './dtos/create-user.dto';
import { UserResponseDto } from './dtos/user-response.dto';
import { UserMapper } from './mappers/user.mapper';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  async create(@Body() data: CreateUserDto): Promise<UserResponseDto> {
    const input = UserMapper.toInput(data);
    const user = await this.usersService.create(input);
    return UserMapper.toResponse(user);
  }
}
