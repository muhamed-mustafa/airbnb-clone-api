import { FavoritesService } from '@application/favorites/services/favorites.service';
import { Roles } from '@common/enums/roles.enum';
import type { JwtPayload } from '@common/interfaces/jwt-payload.interface';
import { PaginationDto } from '@common/pagination/pagination.dto';
import { PaginatedResult } from '@common/pagination/pagination.types';
import { Controller, Delete, Get, HttpCode, HttpStatus, Param, Put, Query } from '@nestjs/common';
import {
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { AllowedRoles } from '@presentation/auth/decorators/roles.decorator';
import { CurrentUser } from '@presentation/auth/decorators/current-user.decorator';
import { UnitFavoriteResponseDto } from '@presentation/favorites/dtos/unit-favorite-response.dto';
import { UnitFavoritesListResponseDto } from '@presentation/favorites/dtos/unit-favorites-list-response.dto';
import { UnitFavoriteMapper } from '@presentation/favorites/mappers/unit-favorite.mapper';
import { SWAGGER_TAGS } from '@presentation/swagger/swagger.constants';
import { UnitIdDto } from '@presentation/units/dtos/unit-id.dto';

@ApiTags(SWAGGER_TAGS.FAVORITES)
@AllowedRoles(Roles.USER)
@Controller('favorites')
export class FavoritesController {
  constructor(private readonly favoritesService: FavoritesService) {}

  @Put(':id')
  @ApiOperation({
    operationId: 'favoritesAddUnit',
    summary: 'Add a unit to my favorites',
    description:
      'Idempotently saves an active unit for the authenticated customer. Repeating the request does not create duplicate records.',
  })
  @ApiParam({
    name: 'id',
    description: 'Active unit MongoDB ObjectId.',
    schema: {
      type: 'string',
      example: '670d1234567890abcdef1237',
      pattern: '^[a-fA-F0-9]{24}$',
    },
  })
  @ApiOkResponse({
    description: 'The unit is saved in the current user favorites.',
    type: UnitFavoriteResponseDto,
  })
  @ApiNotFoundResponse({ description: 'The active unit does not exist.' })
  async add(
    @Param() { id }: UnitIdDto,
    @CurrentUser() user: JwtPayload,
  ): Promise<UnitFavoriteResponseDto> {
    const favorite = await this.favoritesService.add(user.id, id);
    return UnitFavoriteMapper.toResponse(favorite);
  }

  @Get('me')
  @ApiOperation({
    operationId: 'favoritesFindMine',
    summary: 'List my saved units',
    description: 'Returns the authenticated user saved units, newest favorites first.',
  })
  @ApiOkResponse({
    description: 'Paginated favorites with unit details.',
    type: UnitFavoritesListResponseDto,
  })
  async findMine(
    @CurrentUser() user: JwtPayload,
    @Query() query: PaginationDto,
  ): Promise<PaginatedResult<UnitFavoriteResponseDto>> {
    const result = await this.favoritesService.findMy(user.id, query.page, query.limit);
    return {
      ...result,
      data: result.data.map((favorite) => UnitFavoriteMapper.toResponse(favorite)),
    };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    operationId: 'favoritesRemoveUnit',
    summary: 'Remove a unit from my favorites',
    description:
      'Removes this unit from the authenticated user favorites. Repeated requests are safe.',
  })
  @ApiParam({
    name: 'id',
    description: 'Unit MongoDB ObjectId.',
    schema: {
      type: 'string',
      example: '670d1234567890abcdef1237',
      pattern: '^[a-fA-F0-9]{24}$',
    },
  })
  @ApiNoContentResponse({ description: 'The favorite has been removed or did not exist.' })
  async remove(@Param() { id }: UnitIdDto, @CurrentUser() user: JwtPayload): Promise<void> {
    await this.favoritesService.remove(user.id, id);
  }
}
