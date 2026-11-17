import { AppSettingsModule } from '@app/app-settings.module';
import { UnitsModule } from '@app/units.module';
import { BOOKING_REPOSITORY } from '@application/bookings/repositories/booking-repository.token';
import { BookingService } from '@application/bookings/services/booking.service';
import { BookingCalculationUseCase } from '@application/bookings/use-cases/booking-calculation.usecase';
import { BookingValidationUseCase } from '@application/bookings/use-cases/booking-validation.usecase';
import { CheckAvailabilityUseCase } from '@application/bookings/use-cases/check-availability.usecase';
import { BookingRequestUseCase } from '@application/bookings/use-cases/booking-request.usecase';
import { FindAllBookingsUseCase } from '@application/bookings/use-cases/find-all-bookings.usecase';
import { FindMyBookingsUseCase } from '@application/bookings/use-cases/find-my-bookings.usecase';
import { CheckBookingAuthUseCase } from '@application/bookings/use-cases/check-booking-auth.usecase';
import { FindBookingByIdUseCase } from '@application/bookings/use-cases/find-booking-by-id.usecase';
import { modelNames } from '@common/constants/model-names.constant';
import { MongooseBookingAvailabilityRepository } from '@infrastructure/bookings/repositories/mongoose-booking-availability.repository';
import { BookingSchema } from '@infrastructure/bookings/schemas/bookings.schema';
import { UnitSchema } from '@infrastructure/units/schemas/units.schema';
import { UserSchema } from '@infrastructure/users/schemas/user.schema';
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { BookingsController } from '@presentation/bookings/bookings.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: modelNames.BOOKINGS, schema: BookingSchema },
      { name: modelNames.UNITS, schema: UnitSchema },
      { name: modelNames.USERS, schema: UserSchema },
    ]),
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
    FindAllBookingsUseCase,
    FindMyBookingsUseCase,
    CheckBookingAuthUseCase,
    FindBookingByIdUseCase,
    { provide: BOOKING_REPOSITORY, useClass: MongooseBookingAvailabilityRepository },
  ],
})
export class BookingsModule {}
