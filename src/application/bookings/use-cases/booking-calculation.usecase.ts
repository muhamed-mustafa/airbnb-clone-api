import { AppSettingsService } from '@application/app-settings/services/app-settings.service';
import { BookingCalculationInput } from '@application/bookings/inputs/booking-calculation.input';
import { BookingCalculationResponse } from '@application/bookings/outputs/booking-calculation.output';
import { UnitService } from '@application/units/services/unit.service';
import { Injectable } from '@nestjs/common';
import dayjs from 'dayjs';

@Injectable()
export class BookingCalculationUseCase {
  constructor(
    private readonly unitService: UnitService,
    private readonly appSettingsService: AppSettingsService,
  ) {}

  async execute({
    unitId,
    checkIn,
    checkOut,
  }: BookingCalculationInput): Promise<BookingCalculationResponse> {
    const daysCount = dayjs(checkOut).diff(dayjs(checkIn), 'day');

    const [unit, appSettings] = await Promise.all([
      this.unitService.findOne({ id: unitId }),
      this.appSettingsService.findOne(),
    ]);

    const pricePerDay = unit.costPerDay;
    const bookingAmount = Number((daysCount * pricePerDay).toFixed(2));
    const vat = appSettings.vatRate;
    const vatAmount = Number((bookingAmount * (vat / 100)).toFixed(2));
    const totalAmount = Number((bookingAmount + vatAmount).toFixed(2));

    return {
      pricePerDay,
      daysCount,
      bookingAmount,
      vat,
      vatAmount,
      totalAmount,
    };
  }
}
