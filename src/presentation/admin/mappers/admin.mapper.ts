import { AdminEntity } from '../../../application/admin/entities/admin.entity';
import type { LoginInput } from '../../../application/admin/inputs/login-admin.input';
import { LoginOutput } from '../../../application/admin/outputs/login.output';
import { AuthResponseDto } from '../../auth/dtos/auth-response.dto';
import { AdminResponseDto } from '../dtos/admin-response.dto';
import { LoginAdminDto } from '../dtos/login-admin.dto';

export class AdminMapper {
  static toLoginInput(dto: LoginAdminDto): LoginInput {
    return {
      email: dto.email,
      password: dto.password,
    };
  }

  static toAuthResponse(output: LoginOutput): AuthResponseDto {
    return {
      accessToken: output.accessToken,
      refreshToken: output.refreshToken,
    };
  }

  static toResponse(admin: AdminEntity): AdminResponseDto {
    return {
      id: admin.id,
      name: admin.name,
      email: admin.email,
      isSuperAdmin: admin.isSuperAdmin,
    };
  }
}
