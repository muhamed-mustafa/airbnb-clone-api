import { AdminEntity } from '../entities/admin.entity';
import { CreateAdminInput } from '../inputs/create-admin.input';
import { AdminFilter } from './admin-filter';

export interface AdminRepository {
  create(admin: CreateAdminInput): Promise<AdminEntity>;
  find(filter: AdminFilter): Promise<{ items: AdminEntity[]; total: number }>;
  findOne(filter: AdminFilter): Promise<AdminEntity | null>;
  issuePasswordResetCode(
    email: string,
    codeHash: string,
    now: Date,
    expiresAt: Date,
  ): Promise<boolean>;
  incrementPasswordResetAttempts(email: string, now: Date): Promise<void>;
  verifyPasswordResetCode(
    email: string,
    codeHash: string,
    now: Date,
    tokenHash: string,
    tokenExpiresAt: Date,
  ): Promise<boolean>;
  hasValidPasswordResetToken(tokenHash: string, now: Date): Promise<boolean>;
  resetPassword(tokenHash: string, passwordHash: string, now: Date): Promise<string | null>;
}
