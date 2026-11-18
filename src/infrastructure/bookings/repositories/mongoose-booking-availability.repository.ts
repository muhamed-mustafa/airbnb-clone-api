import dayjs from 'dayjs';
import type { BookingEntity } from '@application/bookings/entities/booking.entity';
import type { CreateBookingRecordInput } from '@application/bookings/inputs/create-booking-record.input';
import type { BookingRepository } from '@application/bookings/repositories/booking.repository';
import { BookingParty } from '@application/bookings/enums/booking-party.enum';
import type {
  BookingListFilter,
  MyBookingsFilter,
  OverlappingBookingsFilter,
} from '@application/bookings/repositories/booking-filter';
import { modelNames } from '@common/constants/model-names.constant';
import { Booking } from '@infrastructure/bookings/schemas/bookings.schema';
import { Unit } from '@infrastructure/units/schemas/units.schema';
import { User } from '@infrastructure/users/schemas/user.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model, QueryFilter, Types } from 'mongoose';

type PopulatedReference = { _id: Types.ObjectId; name?: string; title?: string };
type BookingRecord = Omit<Booking, 'unit' | 'guest' | 'host'> & {
  _id: Types.ObjectId;
  unit: Types.ObjectId | PopulatedReference | null;
  guest: Types.ObjectId | PopulatedReference | null;
  host: Types.ObjectId | PopulatedReference | null;
};

export class MongooseBookingAvailabilityRepository implements BookingRepository {
  constructor(
    @InjectModel(modelNames.BOOKINGS) private readonly bookingModel: Model<Booking>,
    @InjectModel(modelNames.USERS) private readonly userModel: Model<User>,
    @InjectModel(modelNames.UNITS) private readonly unitModel: Model<Unit>,
  ) {}

  async find(filter: OverlappingBookingsFilter): Promise<BookingEntity[]> {
    const bookings = await this.bookingModel
      .find({
        unit: new Types.ObjectId(filter.unit),
        status: filter.status,
        checkIn: filter.checkIn,
        checkOut: filter.checkOut,
        ...(filter.excludeBookingId
          ? { _id: { $ne: new Types.ObjectId(filter.excludeBookingId) } }
          : {}),
      })
      .lean()
      .exec();

    return bookings.map((booking) => this.toEntity(booking));
  }

  async create(input: CreateBookingRecordInput): Promise<BookingEntity> {
    const booking = await this.bookingModel.create(input);
    return this.toEntity(booking);
  }

  async findById(id: string): Promise<BookingEntity | null> {
    const booking = await this.bookingModel
      .findById(id)
      .populate<{
        unit: PopulatedReference;
        guest: PopulatedReference;
        host: PopulatedReference;
      }>([
        { path: 'unit', select: 'title' },
        { path: 'guest', select: 'name' },
        { path: 'host', select: 'name' },
      ])
      .exec();
    return booking ? this.toEntity(booking) : null;
  }

  async updateById(
    id: string,
    filter: { guest?: string; host?: string; status: BookingEntity['status'][] },
    changes: Partial<
      Pick<
        BookingEntity,
        | 'checkIn'
        | 'checkOut'
        | 'daysCount'
        | 'pricePerDay'
        | 'bookingAmount'
        | 'vat'
        | 'vatAmount'
        | 'totalAmount'
        | 'adultsCount'
        | 'kidsCount'
        | 'notes'
        | 'status'
        | 'cancellationReason'
      >
    >,
  ): Promise<BookingEntity | null> {
    const booking = await this.bookingModel
      .findOneAndUpdate(
        {
          _id: new Types.ObjectId(id),
          status: { $in: filter.status },
          ...(filter.guest ? { guest: new Types.ObjectId(filter.guest) } : {}),
          ...(filter.host ? { host: new Types.ObjectId(filter.host) } : {}),
        },
        { $set: changes },
        { new: true, runValidators: true },
      )
      .populate([
        { path: 'unit', select: 'title' },
        { path: 'guest', select: 'name' },
        { path: 'host', select: 'name' },
      ])
      .exec();

    return booking ? this.toEntity(booking) : null;
  }

  async findAll(filter: BookingListFilter): Promise<{ items: BookingEntity[]; total: number }> {
    const { search, ...filters } = filter;
    const query = buildListQuery(filters);
    if (search) {
      const escapedSearch = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const pattern = new RegExp(escapedSearch, 'i');
      const [users, units] = await Promise.all([
        this.userModel.find({ name: pattern }).select('_id').lean().exec(),
        this.unitModel.find({ title: pattern }).select('_id').lean().exec(),
      ]);
      const matchingPeople = users.map((user) => user._id);
      const matchingUnits = units.map((unit) => unit._id);
      query.$or = [
        { guest: { $in: matchingPeople } },
        { host: { $in: matchingPeople } },
        { unit: { $in: matchingUnits } },
      ];
    }
    return this.findMatching(query, filter.page ?? 1, filter.limit ?? 10);
  }

  async findForUser(
    userId: string,
    filter: MyBookingsFilter,
  ): Promise<{ items: BookingEntity[]; total: number }> {
    const { party, ...listFilter } = filter;
    const user = new Types.ObjectId(userId);
    const participantFilter: QueryFilter<Booking> =
      party === BookingParty.GUEST
        ? { guest: user }
        : party === BookingParty.HOST
          ? { host: user }
          : { $or: [{ guest: user }, { host: user }] };

    return this.findMatching(
      { ...buildListQuery(listFilter), ...participantFilter },
      filter.page ?? 1,
      filter.limit ?? 10,
    );
  }

  private async findMatching(
    query: QueryFilter<Booking>,
    page: number,
    limit: number,
  ): Promise<{ items: BookingEntity[]; total: number }> {
    const [bookings, total] = await Promise.all([
      this.bookingModel
        .find(query)
        .populate<{
          unit: PopulatedReference;
          guest: PopulatedReference;
          host: PopulatedReference;
        }>([
          { path: 'unit', select: 'title' },
          { path: 'guest', select: 'name' },
          { path: 'host', select: 'name' },
        ])
        .sort({ createdAt: -1, _id: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .exec(),
      this.bookingModel.countDocuments(query).exec(),
    ]);

    return { items: bookings.map((booking) => this.toEntity(booking)), total };
  }

  private toEntity(booking: BookingRecord): BookingEntity {
    const unit = getReference(booking.unit);
    const guest = getReference(booking.guest);
    const host = getReference(booking.host);
    return {
      id: booking._id.toString(),
      unit: unit.id,
      unitTitle: unit.title,
      guest: guest.id,
      guestName: guest.name,
      host: host.id,
      hostName: host.name,
      checkIn: booking.checkIn,
      checkOut: booking.checkOut,
      daysCount: booking.daysCount,
      pricePerDay: booking.pricePerDay,
      bookingAmount: booking.bookingAmount,
      vat: booking.vat,
      vatAmount: booking.vatAmount,
      totalAmount: booking.totalAmount,
      currency: booking.currency,
      adultsCount: booking.adultsCount,
      kidsCount: booking.kidsCount,
      notes: booking.notes,
      status: booking.status,
      cancellationReason: booking.cancellationReason,
      createdAt: booking.createdAt,
      updatedAt: booking.updatedAt,
    };
  }
}

function buildListQuery(filter: BookingListFilter): QueryFilter<Booking> {
  const { status, checkInFrom, checkInTo, createdFrom, createdTo } = filter;

  return {
    ...(status ? { status } : {}),
    ...(checkInFrom || checkInTo
      ? {
          checkIn: {
            ...(checkInFrom ? { $gte: checkInFrom } : {}),
            ...(checkInTo ? { $lte: dayjs(checkInTo).endOf('day').toDate() } : {}),
          },
        }
      : {}),
    ...(createdFrom || createdTo
      ? {
          createdAt: {
            ...(createdFrom ? { $gte: createdFrom } : {}),
            ...(createdTo ? { $lte: dayjs(createdTo).endOf('day').toDate() } : {}),
          },
        }
      : {}),
  };
}

function getReference(reference: Types.ObjectId | PopulatedReference | null): {
  id: string;
  name?: string;
  title?: string;
} {
  // A populated relation can be null when its referenced document was deleted.
  // Keep the booking readable instead of failing the entire admin list response.
  if (!reference) return { id: '' };
  if (reference instanceof Types.ObjectId) return { id: reference.toString() };
  return {
    id: reference._id.toString(),
    name: reference.name,
    title: reference.title,
  };
}
