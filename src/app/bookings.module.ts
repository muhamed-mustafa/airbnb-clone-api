import { Booking, BookingSchema } from '@infrastructure/bookings/schemas/bookings.schema';
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { BookingsController } from '@presentation/bookings/bookings.controller';

@Module({
  imports: [MongooseModule.forFeature([{ name: Booking.name, schema: BookingSchema }])],
  controllers: [BookingsController],
  providers: [],
})
export class BookingsModule {}
