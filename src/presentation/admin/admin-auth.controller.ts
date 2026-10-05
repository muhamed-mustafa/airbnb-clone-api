import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AdminService } from '../../application/admin/services/admin.service';
import { IsPublic } from '../auth/decorators/is-public.decorator';
import { AuthResponseDto } from '../auth/dtos/auth-response.dto';
import { ApiAdminLoginDocs } from '../swagger/decorators/admins/api-admin-login-docs.decorator';
import { SWAGGER_TAGS } from '../swagger/swagger.constants';
import { LoginAdminDto } from './dtos/login-admin.dto';
import { AdminMapper } from './mappers/admin.mapper';

@ApiTags(SWAGGER_TAGS.AUTH)
@Controller('auth/admin')
export class AdminAuthController {
  constructor(private readonly adminService: AdminService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @IsPublic()
  @ApiAdminLoginDocs()
  async login(@Body() body: LoginAdminDto): Promise<AuthResponseDto> {
    const output = await this.adminService.login(AdminMapper.toLoginInput(body));
    return AdminMapper.toAuthResponse(output);
  }
}
