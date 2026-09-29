import type { Logger } from '@common/logging/logger';
import { LOGGER } from '@common/logging/logger.token';
import { Inject, Injectable } from '@nestjs/common';
import { SECRET_HASH_SERVICE_TOKEN } from '../../auth/services/secret-hash-service.token';
import type { SecretHashService } from '../../auth/services/secret-hash.service';
import { AdminEntity } from '../entities/admin.entity';
import { ADMIN_REPOSITORY } from '../repositories/admin-repository.token';
import type { AdminRepository } from '../repositories/admin.repository';
import { INITIALIZE_ADMIN_INPUT } from './initialize-admin-input.token';

export interface InitializeAdminInput {
  name: string;
  email: string;
  password: string;
}

@Injectable()
export class InitializeAdminUseCase {
  constructor(
    @Inject(ADMIN_REPOSITORY) private readonly adminRepository: AdminRepository,
    @Inject(INITIALIZE_ADMIN_INPUT)
    private readonly initializeAdminInput: InitializeAdminInput,
    @Inject(SECRET_HASH_SERVICE_TOKEN)
    private readonly secretHashService: SecretHashService,
    @Inject(LOGGER)
    private readonly logger: Logger,
  ) {}

  async execute(): Promise<AdminEntity> {
    const { name, email, password } = this.initializeAdminInput;

    const existingAdmin = await this.adminRepository.findOne({ email });

    if (existingAdmin) {
      this.logger.info('Admin already exists', { email: existingAdmin.email });
      return existingAdmin;
    }

    const passwordHash = await this.secretHashService.hash(password);

    const admin = await this.adminRepository.create({
      name,
      email,
      password: passwordHash,
      isSuperAdmin: true,
    });

    this.logger.info('Admin created', { email: admin.email });

    return admin;
  }
}
