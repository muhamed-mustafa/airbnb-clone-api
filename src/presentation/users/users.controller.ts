import { UsersService } from '@application/users/services/users.service';
import { Roles } from '@common/enums/roles.enum';
import type { JwtPayload } from '@common/interfaces/jwt-payload.interface';
import { Body, Controller, Get, NotFoundException, Patch } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AllowedRoles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { SWAGGER_TAGS } from '../swagger/swagger.constants';
import { MyProfileDto } from './dtos/my-profile.dto';
import { UpdateMyProfileDto } from './dtos/update-my-profile.dto';

@ApiTags(SWAGGER_TAGS.USERS)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  @AllowedRoles(Roles.USER)
  @ApiOperation({ operationId: 'getMyProfile', summary: 'Get my customer profile' })
  @ApiOkResponse({ type: MyProfileDto })
  async getMe(@CurrentUser() current: JwtPayload): Promise<MyProfileDto> {
    const user = await this.usersService.findOne({ id: current.id });
    if (!user) throw new NotFoundException();
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      emailVerified: user.emailVerifiedAt !== null,
    };
  }

  @Patch('me')
  @AllowedRoles(Roles.USER)
  @ApiOperation({ operationId: 'updateMyProfile', summary: 'Update my display name' })
  @ApiOkResponse({ type: MyProfileDto })
  async updateMe(
    @CurrentUser() current: JwtPayload,
    @Body() body: UpdateMyProfileDto,
  ): Promise<MyProfileDto> {
    const user = await this.usersService.updateName(current.id, body.name);
    if (!user) throw new NotFoundException();
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      emailVerified: user.emailVerifiedAt !== null,
    };
  }
}
