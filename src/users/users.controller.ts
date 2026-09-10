import { Body, Controller, Post } from '@nestjs/common';
import { ApiBody, ApiCreatedResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ApiConflictErrorResponse } from '../common/presentation/swagger/decorators/api-conflict-error-response.decorator';
import { ApiInternalErrorResponse } from '../common/presentation/swagger/decorators/api-internal-error-response.decorator';
import { ApiValidationErrorResponse } from '../common/presentation/swagger/decorators/api-validation-error-response.decorator';
import { SWAGGER_TAGS } from '../common/presentation/swagger/swagger.constants';
import { CreateUserDto } from './dtos/create-user.dto';
import { UserResponseDto } from './dtos/user-response.dto';
import { UserMapper } from './mappers/user.mapper';
import { UsersService } from './users.service';

@ApiTags(SWAGGER_TAGS.USERS)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @ApiOperation({
    operationId: 'usersCreate',
    summary: 'Create a user',
    description:
      'Creates a new user record directly. Prefer `POST /auth/register` for the standard registration flow with token issuance.',
  })
  @ApiBody({ type: CreateUserDto })
  @ApiCreatedResponse({
    description: 'User created successfully.',
    type: UserResponseDto,
  })
  @ApiValidationErrorResponse()
  @ApiConflictErrorResponse()
  @ApiInternalErrorResponse()
  async create(@Body() data: CreateUserDto): Promise<UserResponseDto> {
    const input = UserMapper.toInput(data);
    const user = await this.usersService.create(input);
    return UserMapper.toResponse(user);
  }
}
