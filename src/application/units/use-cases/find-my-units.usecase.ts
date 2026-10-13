import { UnitEntity } from '@application/units/entities/unit-entity';
import { UNIT_REPOSITORY } from '@application/units/repositories/unit-repository.token';
import type { UnitRepository } from '@application/units/repositories/unit.repository';
import type { Logger } from '@common/logging/logger';
import { LOGGER } from '@common/logging/logger.token';
import { PaginatedResult } from '@common/pagination/pagination.types';
import { createPaginationMeta } from '@common/pagination/pagination.utils';
import { Inject, Injectable } from '@nestjs/common';
import { UnitFilter } from '../repositories/unit-filter';

@Injectable()
export class FindAllMyUnitsUseCase {
  constructor(
    @Inject(UNIT_REPOSITORY) private readonly unitRepository: UnitRepository,
    @Inject(LOGGER)
    private readonly logger: Logger,
  ) {}

  async execute(userId: string, filter: UnitFilter = {}): Promise<PaginatedResult<UnitEntity>> {
    const { page = 1, limit = 10 } = filter;

    const { items, total } = await this.unitRepository.find({ ...filter, user: userId });

    this.logger.debug('My units listed', { userId, page, limit, total });

    return {
      data: items,
      meta: createPaginationMeta(page, limit, total),
    };
  }
}
