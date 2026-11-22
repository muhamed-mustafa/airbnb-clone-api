import { BookingCalculationUseCase } from '@application/bookings/use-cases/booking-calculation.usecase';
import { BookingValidationUseCase } from '@application/bookings/use-cases/booking-validation.usecase';
import type { CheckAvailabilityInput } from '@application/bookings/inputs/check-availability.input';
import type { CheckAvailabilityOutput } from '@application/bookings/outputs/check-availability.output';
import { Injectable } from '@nestjs/common';

@Injectable()
export class CheckAvailabilityUseCase {
  constructor(
    private readonly bookingValidationUseCase: BookingValidationUseCase,
    private readonly bookingCalculationUseCase: BookingCalculationUseCase,
  ) {}

  async execute(body: CheckAvailabilityInput): Promise<CheckAvailabilityOutput> {
    const [available, calculation] = await Promise.all([
      this.bookingValidationUseCase.execute(body),
      this.bookingCalculationUseCase.execute({
        unitId: body.unit,
        checkIn: body.checkIn,
        checkOut: body.checkOut,
      }),
    ]);

    return {
      available,
      daysCount: calculation.daysCount,
      pricePerDay: calculation.pricePerDay,
      vat: calculation.vat,
      bookingAmount: calculation.bookingAmount,
      vatAmount: calculation.vatAmount,
      totalAmount: calculation.totalAmount,
    };
  }
}
