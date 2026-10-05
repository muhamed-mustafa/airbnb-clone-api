import { ApplicationError } from '@common/errors/application.error';
import type { Logger } from '@common/logging/logger';
import { LOGGER } from '@common/logging/logger.token';
import { Inject, Injectable } from '@nestjs/common';
import { AdminEntity } from '../entities/admin.entity';
import { AdminFilter } from '../repositories/admin-filter';
import { ADMIN_REPOSITORY } from '../repositories/admin-repository.token';
import type { AdminRepository } from './../repositories/admin.repository';

@Injectable()
export class FindOneAdminUseCase {
  constructor(
    @Inject(ADMIN_REPOSITORY) private readonly adminRepository: AdminRepository,
    @Inject(LOGGER)
    private readonly logger: Logger,
  ) {}

  async execute(query: AdminFilter): Promise<AdminEntity> {
    const admin = await this.adminRepository.findOne(query);

    if (!admin) {
      this.logger.debug('Admin not found', { ...query });
      throw new ApplicationError('ADMIN_NOT_FOUND');
    }

    this.logger.debug('Admin retrieved', { ...query });
    return admin;
  }
}
