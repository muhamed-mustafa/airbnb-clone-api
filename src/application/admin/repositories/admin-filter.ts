import { AdminEntity } from '../entities/admin.entity';

export type AdminFilter = Partial<Pick<AdminEntity, 'name' | 'email' | 'isSuperAdmin'>> & {
  page?: number;
  limit?: number;
};
