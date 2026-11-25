import type { UnitReviewsPage } from '@application/bookings/entities/booking-review.entity';
import { BOOKING_REVIEW_REPOSITORY } from '@application/bookings/repositories/booking-review-repository.token';
import type { BookingReviewRepository } from '@application/bookings/repositories/booking-review.repository';
import { ApplicationError } from '@common/errors/application.error';
import { createPaginationMeta } from '@common/pagination/pagination.utils';
import { Inject, Injectable } from '@nestjs/common';

@Injectable()
export class FindUnitReviewsUseCase {
  constructor(
    @Inject(BOOKING_REVIEW_REPOSITORY) private readonly reviewRepository: BookingReviewRepository,
  ) {}

  async execute(
    unitId: string,
    page = 1,
    limit = 10,
  ): Promise<UnitReviewsPage & { meta: ReturnType<typeof createPaginationMeta> }> {
    const result = await this.reviewRepository.findForUnit(unitId, page, limit);

    if (!result) throw new ApplicationError('UNIT_NOT_FOUND');

    return {
      ...result,
      meta: createPaginationMeta(page, limit, result.total),
    };
  }
}
