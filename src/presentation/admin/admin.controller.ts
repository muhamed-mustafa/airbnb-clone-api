import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AdminService } from '../../application/admin/services/admin.service';
import { Roles } from '../../common/constants/roles.constant';
import { PaginatedResult } from '../../common/pagination/pagination.types';
import { AllowedRoles } from '../auth/decorators/roles.decorator';
import { ApiFindAdminByIdDocs } from '../swagger/decorators/admins/api-find-admin-by-id-docs.decorator';
import { ApiFindAllAdminsDocs } from '../swagger/decorators/admins/api-find-all-admins-docs.decorator';
import { SWAGGER_TAGS } from '../swagger/swagger.constants';
import { AdminIdDto } from './dtos/admin-id.dto';
import { AdminResponseDto } from './dtos/admin-response.dto';
import { FindAllDto } from './dtos/find-all-admins.dto';
import { AdminMapper } from './mappers/admin.mapper';

@ApiTags(SWAGGER_TAGS.ADMINS)
@Controller('admins')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get()
  @AllowedRoles(Roles.ADMIN)
  @ApiFindAllAdminsDocs()
  async findAll(@Query() query: FindAllDto): Promise<PaginatedResult<AdminResponseDto>> {
    const result = await this.adminService.findAll(query);
    return { data: result.data.map((admin) => AdminMapper.toResponse(admin)), meta: result.meta };
  }

  @Get(':id')
  @AllowedRoles(Roles.ADMIN)
  @ApiFindAdminByIdDocs()
  async findById(@Param() params: AdminIdDto): Promise<AdminResponseDto> {
    const output = await this.adminService.findOne({ id: params.id });
    return AdminMapper.toResponse(output);
  }
}
