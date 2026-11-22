import { ApiProperty } from '@nestjs/swagger';
import { BookingReviewResponseDto } from './booking-review-response.dto';

class ReviewsPaginationMetaDto {
  @ApiProperty({ example: 1 }) page!: number;
  @ApiProperty({ example: 10 }) limit!: number;
  @ApiProperty({ example: 12 }) total!: number;
  @ApiProperty({ example: 2 }) totalPages!: number;
  @ApiProperty({ example: true }) hasNextPage!: boolean;
  @ApiProperty({ example: false }) hasPreviousPage!: boolean;
}

export class UnitReviewsResponseDto {
  @ApiProperty({ type: [BookingReviewResponseDto] }) data!: BookingReviewResponseDto[];
  @ApiProperty({ minimum: 0, maximum: 5, example: 4.8 }) ratingAverage!: number;
  @ApiProperty({ minimum: 0, example: 12 }) ratingsCount!: number;
  @ApiProperty({ type: ReviewsPaginationMetaDto }) meta!: ReviewsPaginationMetaDto;
}
