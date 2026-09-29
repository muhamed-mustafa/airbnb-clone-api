import { Injectable, OnModuleInit } from '@nestjs/common';
import { PaginatedResult } from '../../../common/pagination/pagination.types';
import { AdminEntity } from '../entities/admin.entity';
import { LoginInput } from '../inputs/login-admin.input';
import { LoginOutput } from '../outputs/login.output';
import { AdminFilter } from '../repositories/admin-filter';
import { FindAllAdminsUseCase } from '../use-cases/find-all-admins.usecase';
import { FindOneAdminUseCase } from '../use-cases/find-one-admin.usecase';
import { InitializeAdminUseCase } from '../use-cases/initialize-admin.usecase';
import { LoginAdminUseCase } from '../use-cases/login-admin.usecase';

@Injectable()
export class AdminService implements OnModuleInit {
  constructor(
    private readonly initializeAdminUseCase: InitializeAdminUseCase,
    private readonly loginAdminUseCase: LoginAdminUseCase,
    private readonly findAllAdminsUseCase: FindAllAdminsUseCase,
    private readonly findOneAdminUseCase: FindOneAdminUseCase,
  ) {}

  async onModuleInit() {
    await this.initializeAdminUseCase.execute();
  }

  async login(input: LoginInput): Promise<LoginOutput> {
    return await this.loginAdminUseCase.execute(input);
  }
  async findOne(query: AdminFilter): Promise<AdminEntity> {
    return await this.findOneAdminUseCase.execute(query);
  }

  async findAll(query: AdminFilter): Promise<PaginatedResult<AdminEntity>> {
    return await this.findAllAdminsUseCase.execute(query);
  }
}
