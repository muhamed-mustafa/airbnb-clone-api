import { Injectable } from '@nestjs/common';
import { PaginatedResult } from '@common/pagination/pagination.types';
import { AdminEntity } from '../entities/admin.entity';
import { LoginInput } from '../inputs/login-admin.input';
import { LoginOutput } from '../outputs/login.output';
import { AdminFilter } from '../repositories/admin-filter';
import { FindAllAdminsUseCase } from '../use-cases/find-all-admins.usecase';
import { FindOneAdminUseCase } from '../use-cases/find-one-admin.usecase';
import { LoginAdminUseCase } from '../use-cases/login-admin.usecase';
import { AdminPasswordResetUseCase } from '../use-cases/admin-password-reset.usecase';
import type { AdminPasswordResetEmailLanguage } from './admin-password-reset-email-sender';

@Injectable()
export class AdminService {
  constructor(
    private readonly loginAdminUseCase: LoginAdminUseCase,
    private readonly findAllAdminsUseCase: FindAllAdminsUseCase,
    private readonly findOneAdminUseCase: FindOneAdminUseCase,
    private readonly adminPasswordResetUseCase: AdminPasswordResetUseCase,
  ) {}

  async login(input: LoginInput): Promise<LoginOutput> {
    return await this.loginAdminUseCase.execute(input);
  }

  async requestPasswordReset(
    email: string,
    language: AdminPasswordResetEmailLanguage = 'en',
  ): Promise<void> {
    return this.adminPasswordResetUseCase.request(email, language);
  }

  async verifyPasswordReset(email: string, code: string): Promise<{ resetToken: string }> {
    return this.adminPasswordResetUseCase.verify(email, code);
  }

  async completePasswordReset(resetToken: string, newPassword: string): Promise<void> {
    return this.adminPasswordResetUseCase.complete(resetToken, newPassword);
  }
  async findOne(query: AdminFilter): Promise<AdminEntity> {
    return await this.findOneAdminUseCase.execute(query);
  }

  async findAll(query: AdminFilter): Promise<PaginatedResult<AdminEntity>> {
    return await this.findAllAdminsUseCase.execute(query);
  }
}
