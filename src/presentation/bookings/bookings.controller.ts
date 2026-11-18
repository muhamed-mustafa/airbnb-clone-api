import { BookingService } from '@application/bookings/services/booking.service';
import { Roles } from '@common/enums/roles.enum';
import type { JwtPayload } from '@common/interfaces/jwt-payload.interface';
import { PaginatedResult } from '@common/pagination/pagination.types';
import { Body, Controller, Get, Param, Patch, Post, Query } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { CurrentUser } from '@presentation/auth/decorators/current-user.decorator';
import { IsPublic } from '@presentation/auth/decorators/is-public.decorator';
import { AllowedRoles } from '@presentation/auth/decorators/roles.decorator';
import { AvailabilityResponseDto } from '@presentation/bookings/dtos/availability-response.dto';
import { BookingRequestDto } from '@presentation/bookings/dtos/booking-request.dto';
import { BookingIdDto } from '@presentation/bookings/dtos/booking-id.dto';
import { BookingResponseDto } from '@presentation/bookings/dtos/booking-response.dto';
import { BookingListResponseDto } from '@presentation/bookings/dtos/booking-list-response.dto';
import { CheckAvailabilityDto } from '@presentation/bookings/dtos/check-availability.dto';
import { FindAllBookingsDto } from '@presentation/bookings/dtos/find-all-bookings.dto';
import { FindMyBookingsDto } from '@presentation/bookings/dtos/find-my-bookings.dto';
import { UpdateBookingRequestDto } from '@presentation/bookings/dtos/update-booking-request.dto';
import { CancelBookingDto } from '@presentation/bookings/dtos/cancel-booking.dto';
import { UpdateBookingStatusDto } from '@presentation/bookings/dtos/update-booking-status.dto';
import { BookingMapper } from '@presentation/bookings/mappers/booking.mapper';
import { ApiFindBookingsDocs } from '@presentation/swagger/decorators/api-find-bookings-docs.decorator';
import { SWAGGER_TAGS } from '@presentation/swagger/swagger.constants';

@ApiTags(SWAGGER_TAGS.BOOKINGS)
@Controller('bookings')
export class BookingsController {
  constructor(private readonly bookingService: BookingService) {}

  @Get('admin')
  @AllowedRoles(Roles.ADMIN)
  @ApiFindBookingsDocs(
    'bookingsFindAllForAdmin',
    'List all bookings (admin)',
    'Returns a paginated list of all bookings. Supports searching guest, host, and unit names, and filtering by status and date ranges.',
  )
  async findAllForAdmin(
    @Query() query: FindAllBookingsDto,
  ): Promise<PaginatedResult<BookingListResponseDto>> {
    const result = await this.bookingService.findAll(query);
    return { ...result, data: result.data.map((booking) => BookingMapper.toListResponse(booking)) };
  }

  @Get('me')
  @AllowedRoles(Roles.USER)
  @ApiFindBookingsDocs(
    'bookingsFindMyBookings',
    'List my bookings',
    'Returns bookings where the authenticated user is the guest or host. By default both are included; party can limit results to guest or host. Supports filtering by status, unit, check-in date range, and creation date range.',
  )
  async findMyBookings(
    @CurrentUser() user: JwtPayload,
    @Query() query: FindMyBookingsDto,
  ): Promise<PaginatedResult<BookingListResponseDto>> {
    const result = await this.bookingService.findMyBookings(user.id, query);
    return { ...result, data: result.data.map((booking) => BookingMapper.toListResponse(booking)) };
  }

  @Post()
  @AllowedRoles(Roles.USER)
  @ApiOperation({
    operationId: 'bookingsCreateRequest',
    summary: 'Request a booking for a unit',
  })
  @ApiCreatedResponse({ description: 'Booking request created.', type: BookingResponseDto })
  @ApiBadRequestResponse({ description: 'The booking details are invalid.' })
  @ApiConflictResponse({ description: 'The unit is unavailable for the selected dates.' })
  async requestBooking(
    @Body() body: BookingRequestDto,
    @CurrentUser() user: JwtPayload,
  ): Promise<BookingResponseDto> {
    const booking = await this.bookingService.requestBooking(
      BookingMapper.toRequestInput(body),
      user.id,
    );

    return BookingMapper.toResponse(booking);
  }

  @Patch(':id')
  @AllowedRoles(Roles.USER)
  @ApiOperation({
    operationId: 'bookingsUpdateRequestByGuest',
    summary: 'Update a pending booking request as its guest',
    description:
      'The booking guest may update dates, guest counts, or notes while the request is pending. Dates and guest capacity are revalidated, availability excludes this booking itself, and the price breakdown is recalculated from current unit settings.',
  })
  @ApiParam({
    name: 'id',
    description: 'Booking MongoDB ObjectId.',
    example: '670d1234567890abcdef123a',
  })
  @ApiOkResponse({ description: 'Updated booking request.', type: BookingListResponseDto })
  @ApiBadRequestResponse({
    description: 'The update is empty or contains invalid dates or values.',
  })
  @ApiConflictResponse({
    description: 'The booking is not pending or the requested dates/capacity are unavailable.',
  })
  @ApiForbiddenResponse({ description: 'Only the guest who created this booking may update it.' })
  @ApiNotFoundResponse({ description: 'The booking does not exist.' })
  async updateRequestByGuest(
    @Param() { id }: BookingIdDto,
    @Body() body: UpdateBookingRequestDto,
    @CurrentUser() user: JwtPayload,
  ): Promise<BookingListResponseDto> {
    const booking = await this.bookingService.updateRequestByGuest(
      id,
      user.id,
      BookingMapper.toUpdateRequestInput(body),
    );
    return BookingMapper.toListResponse(booking);
  }

  @Patch(':id/cancel')
  @AllowedRoles(Roles.USER)
  @ApiOperation({
    operationId: 'bookingsCancelByGuest',
    summary: 'Cancel a booking as its guest',
    description:
      'The guest may cancel a pending or confirmed booking. The optional reason is saved with the booking.',
  })
  @ApiParam({
    name: 'id',
    description: 'Booking MongoDB ObjectId.',
    example: '670d1234567890abcdef123a',
  })
  @ApiOkResponse({ description: 'Cancelled booking.', type: BookingListResponseDto })
  @ApiBadRequestResponse({
    description: 'The cancellation reason exceeds the supported length or is invalid.',
  })
  @ApiConflictResponse({
    description: 'The booking is already declined or cancelled, or changed concurrently.',
  })
  @ApiForbiddenResponse({ description: 'Only the guest who created this booking may cancel it.' })
  @ApiNotFoundResponse({ description: 'The booking does not exist.' })
  async cancelByGuest(
    @Param() { id }: BookingIdDto,
    @Body() body: CancelBookingDto,
    @CurrentUser() user: JwtPayload,
  ): Promise<BookingListResponseDto> {
    const booking = await this.bookingService.cancelByGuest(id, user.id, body);
    return BookingMapper.toListResponse(booking);
  }

  @Patch(':id/status')
  @AllowedRoles(Roles.USER)
  @ApiOperation({
    operationId: 'bookingsUpdateStatusByHost',
    summary: 'Confirm or decline a pending booking as its host',
    description:
      'Only the assigned host can change a pending request to CONFIRMED or DECLINED. Confirmation is rejected if another confirmed booking overlaps the same unit and dates.',
  })
  @ApiParam({
    name: 'id',
    description: 'Booking MongoDB ObjectId.',
    example: '670d1234567890abcdef123a',
  })
  @ApiOkResponse({ description: 'Updated booking status.', type: BookingListResponseDto })
  @ApiBadRequestResponse({ description: 'Only CONFIRMED and DECLINED are valid host decisions.' })
  @ApiConflictResponse({
    description: 'The request is no longer pending or its dates are already confirmed.',
  })
  @ApiForbiddenResponse({
    description: 'Only the host assigned to this booking may change its status.',
  })
  @ApiNotFoundResponse({ description: 'The booking does not exist.' })
  async updateStatusByHost(
    @Param() { id }: BookingIdDto,
    @Body() body: UpdateBookingStatusDto,
    @CurrentUser() user: JwtPayload,
  ): Promise<BookingListResponseDto> {
    const booking = await this.bookingService.updateStatusByHost(id, user.id, body.status);
    return BookingMapper.toListResponse(booking);
  }

  @Get('check-availability')
  @IsPublic()
  @ApiOperation({
    operationId: 'bookingsCheckAvailability',
    summary: 'Check unit availability and calculate booking price',
  })
  @ApiOkResponse({
    description: 'Availability and price calculated.',
    type: AvailabilityResponseDto,
  })
  @ApiBadRequestResponse({ description: 'The provided dates or booking details are invalid.' })
  async checkAvailability(@Query() query: CheckAvailabilityDto): Promise<AvailabilityResponseDto> {
    return this.bookingService.checkAvailability(query);
  }

  @Get(':id')
  @AllowedRoles(Roles.USER)
  @ApiOperation({
    operationId: 'bookingsFindById',
    summary: 'Get a booking as its guest or host',
    description: 'Only the guest or host assigned to the booking can view its details.',
  })
  @ApiParam({
    name: 'id',
    description: 'Booking MongoDB ObjectId.',
    schema: { type: 'string', pattern: '^[a-fA-F0-9]{24}$' },
    example: '670d1234567890abcdef123a',
  })
  @ApiOkResponse({ description: 'Booking details.', type: BookingListResponseDto })
  @ApiForbiddenResponse({
    description: 'The authenticated user is not a guest or host on this booking.',
  })
  @ApiNotFoundResponse({ description: 'The booking does not exist.' })
  async findById(
    @Param() { id }: BookingIdDto,
    @CurrentUser() user: JwtPayload,
  ): Promise<BookingListResponseDto> {
    const booking = await this.bookingService.findById(id, user.id);
    return BookingMapper.toListResponse(booking);
  }
}
