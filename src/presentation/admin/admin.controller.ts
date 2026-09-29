import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AdminService } from '../../application/admin/services/admin.service';
import { PaginatedResult } from '../../common/pagination/pagination.types';
import { AuthResponseDto } from '../auth/dtos/auth-response.dto';
import { ApiAdminLoginDocs } from '../swagger/decorators/admins/api-admin-login-docs.decorator';
import { ApiFindAllAdminsDocs } from '../swagger/decorators/admins/api-find-all-admins-docs.decorator';
import { SWAGGER_TAGS } from '../swagger/swagger.constants';
import { AdminResponseDto } from './dtos/admin-response.dto';
import { FindAllDto } from './dtos/find-all-admins.dto';
import { LoginAdminDto } from './dtos/login-admin.dto';
import { AdminMapper } from './mappers/admin.mapper';

@ApiTags(SWAGGER_TAGS.ADMINS)
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Post('login')
  @ApiAdminLoginDocs()
  async login(@Body() body: LoginAdminDto): Promise<AuthResponseDto> {
    const input = AdminMapper.toLoginInput(body);
    const output = await this.adminService.login(input);
    return AdminMapper.toAuthResponse(output);
  }

  @Get()
  @ApiFindAllAdminsDocs()
  async findAll(@Query() query: FindAllDto): Promise<PaginatedResult<AdminResponseDto>> {
    const output = await this.adminService.findAll(query);

    return {
      data: output.data.map((admin) => AdminMapper.toResponse(admin)),
      meta: output.meta,
    };
  }
}
