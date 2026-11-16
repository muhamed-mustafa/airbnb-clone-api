import { BookingService } from '@application/bookings/services/booking.service';
import { Roles } from '@common/enums/roles.enum';
import type { JwtPayload } from '@common/interfaces/jwt-payload.interface';
import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { CurrentUser } from '@presentation/auth/decorators/current-user.decorator';
import { IsPublic } from '@presentation/auth/decorators/is-public.decorator';
import { AllowedRoles } from '@presentation/auth/decorators/roles.decorator';
import { AvailabilityResponseDto } from '@presentation/bookings/dtos/availability-response.dto';
import { BookingRequestDto } from '@presentation/bookings/dtos/booking-request.dto';
import { BookingResponseDto } from '@presentation/bookings/dtos/booking-response.dto';
import { CheckAvailabilityDto } from '@presentation/bookings/dtos/check-availability.dto';
import { BookingMapper } from '@presentation/bookings/mappers/booking.mapper';
import { SWAGGER_TAGS } from '@presentation/swagger/swagger.constants';

@ApiTags(SWAGGER_TAGS.BOOKINGS)
@Controller('bookings')
export class BookingsController {
  constructor(private readonly bookingService: BookingService) {}

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
}
