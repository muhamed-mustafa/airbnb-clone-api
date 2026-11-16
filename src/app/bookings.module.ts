import { AppSettingsModule } from '@app/app-settings.module';
import { UnitsModule } from '@app/units.module';
import { BOOKING_REPOSITORY } from '@application/bookings/repositories/booking-repository.token';
import { BookingService } from '@application/bookings/services/booking.service';
import { BookingCalculationUseCase } from '@application/bookings/use-cases/booking-calculation.usecase';
import { BookingValidationUseCase } from '@application/bookings/use-cases/booking-validation.usecase';
import { CheckAvailabilityUseCase } from '@application/bookings/use-cases/check-availability.usecase';
import { BookingRequestUseCase } from '@application/bookings/use-cases/booking-request.usecase';
import { modelNames } from '@common/constants/model-names.constant';
import { MongooseBookingAvailabilityRepository } from '@infrastructure/bookings/repositories/mongoose-booking-availability.repository';
import { BookingSchema } from '@infrastructure/bookings/schemas/bookings.schema';
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { BookingsController } from '@presentation/bookings/bookings.controller';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: modelNames.BOOKINGS, schema: BookingSchema }]),
    AppSettingsModule,
    UnitsModule,
  ],
  controllers: [BookingsController],
  providers: [
    BookingService,
    BookingCalculationUseCase,
    BookingValidationUseCase,
    CheckAvailabilityUseCase,
    BookingRequestUseCase,
    { provide: BOOKING_REPOSITORY, useClass: MongooseBookingAvailabilityRepository },
  ],
})
export class BookingsModule {}
