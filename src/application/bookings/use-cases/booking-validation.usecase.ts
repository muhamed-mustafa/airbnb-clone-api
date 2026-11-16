import dayjs from 'dayjs';
import { BookingStatus } from '@application/bookings/enums/booking-status.enum';
import type { BookingValidationInput } from '@application/bookings/inputs/booking-validation.input';
import { BOOKING_REPOSITORY } from '@application/bookings/repositories/booking-repository.token';
import type { BookingAvailabilityRepository } from '@application/bookings/repositories/booking-availability.repository';
import type { UnitEntity } from '@application/units/entities/unit-entity';
import { UnitService } from '@application/units/services/unit.service';
import { Inject, Injectable } from '@nestjs/common';

@Injectable()
export class BookingValidationUseCase {
  constructor(
    @Inject(BOOKING_REPOSITORY)
    private readonly bookingRepository: BookingAvailabilityRepository,
    private readonly unitService: UnitService,
  ) {}

  async execute(body: BookingValidationInput): Promise<boolean> {
    if (!this.validateDateRange(body)) {
      return false;
    }

    const [hasCapacity, isAvailable] = await Promise.all([
      this.validateCapacity(body),
      this.validateUnitAvailability(body),
    ]);

    return hasCapacity && isAvailable;
  }

  private async validateUnitAvailability(body: BookingValidationInput): Promise<boolean> {
    const overlappingBookings = await this.bookingRepository.find({
      unit: body.unit,
      status: { $in: [BookingStatus.PENDING, BookingStatus.CONFIRMED] },
      checkIn: { $lt: body.checkOut },
      checkOut: { $gt: body.checkIn },
    });

    return overlappingBookings.length === 0;
  }

  private async validateCapacity(body: BookingValidationInput): Promise<boolean> {
    const unit: UnitEntity = await this.unitService.findOne({ id: body.unit });

    return (
      unit.availability &&
      (body.adultsCount ?? 1) <= unit.adultsCount &&
      (body.kidsCount ?? 0) <= unit.kidsCount
    );
  }

  private validateDateRange(body: BookingValidationInput): boolean {
    const checkIn = dayjs(body.checkIn);
    const checkOut = dayjs(body.checkOut);

    return checkIn.isValid() && checkOut.isValid() && checkOut.isAfter(checkIn, 'day');
  }
}
