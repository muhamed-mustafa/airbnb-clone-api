import { Body, Controller, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ApiCreateUserDocs } from '../swagger/decorators/users/api-create-user-docs.decorator';
import { SWAGGER_TAGS } from '../swagger/swagger.constants';
import { CreateUserDto } from './dtos/create-user.dto';
import { UserResponseDto } from './dtos/user-response.dto';
import { UserMapper } from './mappers/user.mapper';
import { UsersService } from '../../application/users/services/users.service';

@ApiTags(SWAGGER_TAGS.USERS)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @ApiCreateUserDocs()
  async create(@Body() data: CreateUserDto): Promise<UserResponseDto> {
    const input = UserMapper.toInput(data);
    const user = await this.usersService.create(input);
    return UserMapper.toResponse(user);
  }
}
