import type { BookingEntity } from '@application/bookings/entities/booking.entity';
import { BookingStatus } from '@application/bookings/enums/booking-status.enum';
import type { UpdateBookingRequestInput } from '@application/bookings/inputs/update-booking-request.input';
import { BOOKING_REPOSITORY } from '@application/bookings/repositories/booking-repository.token';
import type { BookingRepository } from '@application/bookings/repositories/booking.repository';
import { BookingCalculationUseCase } from '@application/bookings/use-cases/booking-calculation.usecase';
import { BookingValidationUseCase } from '@application/bookings/use-cases/booking-validation.usecase';
import { UnitService } from '@application/units/services/unit.service';
import { ApplicationError } from '@common/errors/application.error';
import { Inject, Injectable } from '@nestjs/common';

@Injectable()
export class UpdateBookingRequestByGuestUseCase {
  constructor(
    @Inject(BOOKING_REPOSITORY) private readonly bookingRepository: BookingRepository,
    private readonly bookingValidationUseCase: BookingValidationUseCase,
    private readonly bookingCalculationUseCase: BookingCalculationUseCase,
    private readonly unitService: UnitService,
  ) {}

  async execute(
    bookingId: string,
    guestId: string,
    input: UpdateBookingRequestInput,
  ): Promise<BookingEntity> {
    const booking = await this.bookingRepository.findById(bookingId);
    if (!booking) throw new ApplicationError('BOOKING_NOT_FOUND');

    if (booking.guest !== guestId) throw new ApplicationError('BOOKING_ACCESS_DENIED');

    if (booking.status !== BookingStatus.PENDING) {
      throw new ApplicationError('BOOKING_INVALID_STATUS_TRANSITION');
    }

    if (Object.values(input).every((value) => value === undefined)) {
      throw new ApplicationError('BOOKING_UPDATE_EMPTY');
    }

    const checkIn = input.checkIn ?? booking.checkIn;
    const checkOut = input.checkOut ?? booking.checkOut;
    const adultsCount = input.adultsCount ?? booking.adultsCount;
    const kidsCount = input.kidsCount ?? booking.kidsCount;

    if (checkOut.getTime() <= checkIn.getTime()) {
      throw new ApplicationError('BOOKING_INVALID_DATE_RANGE');
    }

    await this.unitService.findOne({ id: booking.unit, isActive: true });

    const isAvailable = await this.bookingValidationUseCase.execute({
      unit: booking.unit,
      checkIn,
      checkOut,
      adultsCount,
      kidsCount,
      excludeBookingId: booking.id,
    });

    if (!isAvailable) throw new ApplicationError('BOOKING_NOT_AVAILABLE');

    const calculation = await this.bookingCalculationUseCase.execute({
      unitId: booking.unit,
      checkIn,
      checkOut,
    });

    const updated = await this.bookingRepository.updateById(
      booking.id,
      { guest: guestId, status: [BookingStatus.PENDING] },
      {
        checkIn,
        checkOut,
        adultsCount,
        kidsCount,
        ...(input.notes !== undefined ? { notes: input.notes } : {}),
        ...calculation,
      },
    );

    if (!updated) throw new ApplicationError('BOOKING_INVALID_STATUS_TRANSITION');

    return updated;
  }
}
