import { ApiProperty } from '@nestjs/swagger';
import { UnitFavoriteResponseDto } from './unit-favorite-response.dto';

class FavoritesPaginationMetaDto {
  @ApiProperty({ example: 1 }) page!: number;
  @ApiProperty({ example: 10 }) limit!: number;
  @ApiProperty({ example: 12 }) total!: number;
  @ApiProperty({ example: 2 }) totalPages!: number;
  @ApiProperty({ example: true }) hasNextPage!: boolean;
  @ApiProperty({ example: false }) hasPreviousPage!: boolean;
}

export class UnitFavoritesListResponseDto {
  @ApiProperty({ type: [UnitFavoriteResponseDto] }) data!: UnitFavoriteResponseDto[];
  @ApiProperty({ type: FavoritesPaginationMetaDto }) meta!: FavoritesPaginationMetaDto;
}
