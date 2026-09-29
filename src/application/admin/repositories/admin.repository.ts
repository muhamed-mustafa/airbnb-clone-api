import { AdminEntity } from '../entities/admin.entity';
import { CreateAdminInput } from '../inputs/create-admin.input';
import { AdminFilter } from './admin-filter';

export interface AdminRepository {
  create(admin: CreateAdminInput): Promise<AdminEntity>;
  find(filter: AdminFilter): Promise<{ items: AdminEntity[]; total: number }>;
  findOne(filter: AdminFilter): Promise<AdminEntity | null>;
}
