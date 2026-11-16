import { BookingEntity } from '@application/bookings/entities/booking.entity';
import { BookingStatus } from '@application/bookings/enums/booking-status.enum';
import type { BookingRequestInput } from '@application/bookings/inputs/booking-request.input';
import { BOOKING_REPOSITORY } from '@application/bookings/repositories/booking-repository.token';
import type { BookingRepository } from '@application/bookings/repositories/booking.repository';
import { BookingCalculationUseCase } from '@application/bookings/use-cases/booking-calculation.usecase';
import { BookingValidationUseCase } from '@application/bookings/use-cases/booking-validation.usecase';
import { UnitService } from '@application/units/services/unit.service';
import { ApplicationError } from '@common/errors/application.error';
import { Inject, Injectable } from '@nestjs/common';

@Injectable()
export class BookingRequestUseCase {
  constructor(
    @Inject(BOOKING_REPOSITORY) private readonly bookingRepository: BookingRepository,
    private readonly bookingValidationUseCase: BookingValidationUseCase,
    private readonly bookingCalculationUseCase: BookingCalculationUseCase,
    private readonly unitService: UnitService,
  ) {}

  async execute(input: BookingRequestInput, guestId: string): Promise<BookingEntity> {
    const unit = await this.unitService.findOne({ id: input.unit, isActive: true });

    if (unit.user === guestId) {
      throw new ApplicationError('BOOKING_CANNOT_BOOK_OWN_UNIT');
    }

    const isAvailable = await this.bookingValidationUseCase.execute(input);

    if (!isAvailable) {
      throw new ApplicationError('BOOKING_NOT_AVAILABLE');
    }

    const calculation = await this.bookingCalculationUseCase.execute({
      unitId: input.unit,
      checkIn: input.checkIn,
      checkOut: input.checkOut,
    });

    return this.bookingRepository.create({
      unit: unit.id,
      guest: guestId,
      host: unit.user,
      checkIn: input.checkIn,
      checkOut: input.checkOut,
      adultsCount: input.adultsCount ?? 1,
      kidsCount: input.kidsCount ?? 0,
      notes: input.notes,
      pricePerDay: calculation.pricePerDay,
      daysCount: calculation.daysCount,
      bookingAmount: calculation.bookingAmount,
      vat: calculation.vat,
      vatAmount: calculation.vatAmount,
      totalAmount: calculation.totalAmount,
      status: BookingStatus.PENDING,
    });
  }
}
