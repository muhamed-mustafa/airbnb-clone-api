import type { Logger } from '@common/logging/logger';
import { LOGGER } from '@common/logging/logger.token';
import { PaginatedResult } from '@common/pagination/pagination.types';
import { createPaginationMeta } from '@common/pagination/pagination.utils';
import { Inject, Injectable } from '@nestjs/common';
import { AdminEntity } from '../entities/admin.entity';
import { AdminFilter } from '../repositories/admin-filter';
import { ADMIN_REPOSITORY } from '../repositories/admin-repository.token';
import type { AdminRepository } from '../repositories/admin.repository';

@Injectable()
export class FindAllAdminsUseCase {
  constructor(
    @Inject(ADMIN_REPOSITORY) private readonly adminRepository: AdminRepository,
    @Inject(LOGGER)
    private readonly logger: Logger,
  ) {}

  async execute(filter: AdminFilter = {}): Promise<PaginatedResult<AdminEntity>> {
    const { page = 1, limit = 10 } = filter;

    const { items, total } = await this.adminRepository.find(filter);

    this.logger.debug('Admins listed', { page, limit, total });

    return {
      data: items,
      meta: createPaginationMeta(page, limit, total),
    };
  }
}
