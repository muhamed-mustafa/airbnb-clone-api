import type { HydratedDocument } from 'mongoose';
import { AdminEntity } from '../../../application/admin/entities/admin.entity';
import { Admin } from '../schemas/admin.schema';

export class AdminMapper {
  static toEntity(admin: HydratedDocument<Admin>): AdminEntity {
    return {
      id: admin._id.toString(),
      name: admin.name,
      email: admin.email,
      password: admin.password,
      isSuperAdmin: admin.isSuperAdmin,
    };
  }
}
