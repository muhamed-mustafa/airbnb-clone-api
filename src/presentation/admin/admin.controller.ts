import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AdminService } from '../../application/admin/services/admin.service';
import { Roles } from '../../common/constants/roles.constant';
import { PaginatedResult } from '../../common/pagination/pagination.types';
import { IsPublic } from '../auth/decorators/is-public.decorator';
import { AllowedRoles } from '../auth/decorators/roles.decorator';
import { AuthResponseDto } from '../auth/dtos/auth-response.dto';
import { ApiAdminLoginDocs } from '../swagger/decorators/admins/api-admin-login-docs.decorator';
import { ApiFindAdminByIdDocs } from '../swagger/decorators/admins/api-find-admin-by-id-docs.decorator';
import { ApiFindAllAdminsDocs } from '../swagger/decorators/admins/api-find-all-admins-docs.decorator';
import { SWAGGER_TAGS } from '../swagger/swagger.constants';
import { AdminIdDto } from './dtos/admin-id.dto';
import { AdminResponseDto } from './dtos/admin-response.dto';
import { FindAllDto } from './dtos/find-all-admins.dto';
import { LoginAdminDto } from './dtos/login-admin.dto';
import { AdminMapper } from './mappers/admin.mapper';

@ApiTags(SWAGGER_TAGS.ADMINS)
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Post('login')
  @IsPublic()
  @ApiAdminLoginDocs()
  async login(@Body() body: LoginAdminDto): Promise<AuthResponseDto> {
    const input = AdminMapper.toLoginInput(body);
    const output = await this.adminService.login(input);
    return AdminMapper.toAuthResponse(output);
  }

  @Get()
  @AllowedRoles(Roles.ADMIN)
  @ApiFindAllAdminsDocs()
  async findAll(@Query() query: FindAllDto): Promise<PaginatedResult<AdminResponseDto>> {
    const output = await this.adminService.findAll(query);

    return {
      data: output.data.map((admin) => AdminMapper.toResponse(admin)),
      meta: output.meta,
    };
  }

  @Get(':id')
  @AllowedRoles(Roles.ADMIN)
  @ApiFindAdminByIdDocs()
  async findById(@Param() params: AdminIdDto): Promise<AdminResponseDto> {
    const output = await this.adminService.findOne({ id: params.id });
    return AdminMapper.toResponse(output);
  }
}
