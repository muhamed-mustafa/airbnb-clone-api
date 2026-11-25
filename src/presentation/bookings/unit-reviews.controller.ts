import { BookingService } from '@application/bookings/services/booking.service';
import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiNotFoundResponse, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { IsPublic } from '@presentation/auth/decorators/is-public.decorator';
import { SWAGGER_TAGS } from '@presentation/swagger/swagger.constants';
import { UnitIdDto } from '@presentation/units/dtos/unit-id.dto';
import { FindUnitReviewsDto } from './dtos/find-unit-reviews.dto';
import { UnitReviewsResponseDto } from './dtos/unit-reviews-response.dto';
import { BookingMapper } from './mappers/booking.mapper';

@ApiTags(SWAGGER_TAGS.UNITS)
@Controller('units')
export class UnitReviewsController {
  constructor(private readonly bookingService: BookingService) {}

  @Get(':id/reviews')
  @IsPublic()
  @ApiOperation({ operationId: 'unitsFindReviews', summary: 'List paginated reviews for a unit' })
  @ApiOkResponse({
    description: 'Reviews sorted newest first with the unit rating summary.',
    type: UnitReviewsResponseDto,
  })
  @ApiNotFoundResponse({ description: 'The unit does not exist.' })
  async findForUnit(
    @Param() { id }: UnitIdDto,
    @Query() query: FindUnitReviewsDto,
  ): Promise<UnitReviewsResponseDto> {
    const result = await this.bookingService.findUnitReviews(id, query.page, query.limit);

    return {
      data: result.items.map((review) => BookingMapper.toReviewResponse(review)),
      ratingAverage: result.ratingAverage,
      ratingsCount: result.ratingsCount,
      meta: result.meta,
    };
  }
}
