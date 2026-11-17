import { BookingParty } from '@application/bookings/enums/booking-party.enum';
import { Booking } from '@infrastructure/bookings/schemas/bookings.schema';
import { Model, Types } from 'mongoose';
import { MongooseBookingAvailabilityRepository } from './mongoose-booking-availability.repository';

describe('MongooseBookingAvailabilityRepository.findForUser', () => {
  const userId = '670d1234567890abcdef1238';

  function setup() {
    const query = {
      populate: jest.fn().mockReturnThis(),
      sort: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      exec: jest.fn().mockResolvedValue([]),
    };
    const find = jest.fn().mockReturnValue(query);
    const countDocuments = jest.fn().mockReturnValue({ exec: jest.fn().mockResolvedValue(0) });
    const model = { find, countDocuments } as unknown as Model<Booking>;

    return {
      repository: new MongooseBookingAvailabilityRepository(
        model,
        {} as Model<import('@infrastructure/users/schemas/user.schema').User>,
        {} as Model<import('@infrastructure/units/schemas/units.schema').Unit>,
      ),
      find,
    };
  }

  it('includes bookings where the user is either guest or host by default', async () => {
    const { repository, find } = setup();

    await repository.findForUser(userId, {});

    const user = new Types.ObjectId(userId);
    expect(find).toHaveBeenCalledWith({ $or: [{ guest: user }, { host: user }] });
  });

  it('filters bookings to the selected party', async () => {
    const { repository, find } = setup();

    await repository.findForUser(userId, { party: BookingParty.HOST });

    expect(find).toHaveBeenCalledWith({ host: new Types.ObjectId(userId) });
  });

  it('searches guest, host, and unit display names without requiring ids', async () => {
    const userId = new Types.ObjectId('670d1234567890abcdef1238');
    const unitId = new Types.ObjectId('670d1234567890abcdef1237');
    const users = { find: jest.fn() };
    const units = { find: jest.fn() };
    const userQuery = {
      select: jest.fn().mockReturnThis(),
      lean: jest.fn().mockReturnThis(),
      exec: jest.fn().mockResolvedValue([{ _id: userId }]),
    };
    const unitQuery = {
      select: jest.fn().mockReturnThis(),
      lean: jest.fn().mockReturnThis(),
      exec: jest.fn().mockResolvedValue([{ _id: unitId }]),
    };
    users.find.mockReturnValue(userQuery);
    units.find.mockReturnValue(unitQuery);
    const findBookings = jest.fn().mockReturnValue({
      populate: jest.fn().mockReturnThis(),
      sort: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      exec: jest.fn().mockResolvedValue([]),
    });
    const model = {
      find: findBookings,
      countDocuments: jest.fn().mockReturnValue({ exec: jest.fn().mockResolvedValue(0) }),
    } as unknown as Model<Booking>;
    const searchableRepository = new MongooseBookingAvailabilityRepository(
      model,
      users as unknown as Model<import('@infrastructure/users/schemas/user.schema').User>,
      units as unknown as Model<import('@infrastructure/units/schemas/units.schema').Unit>,
    );

    await searchableRepository.findAll({ search: 'Mohamed' });

    expect(users.find.mock.calls[0]).toEqual([{ name: /Mohamed/i }]);
    expect(units.find.mock.calls[0]).toEqual([{ title: /Mohamed/i }]);
    expect(findBookings.mock.calls[0]).toEqual([
      {
        $or: [
          { guest: { $in: [userId] } },
          { host: { $in: [userId] } },
          { unit: { $in: [unitId] } },
        ],
      },
    ]);
  });
});

describe('MongooseBookingAvailabilityRepository.findById', () => {
  it('loads a booking by its Mongo id and maps it to the application entity', async () => {
    const id = new Types.ObjectId('670d1234567890abcdef123a');
    const booking = {
      _id: id,
      unit: new Types.ObjectId('670d1234567890abcdef1237'),
      guest: new Types.ObjectId('670d1234567890abcdef1238'),
      host: new Types.ObjectId('670d1234567890abcdef1239'),
      checkIn: new Date('2027-01-10'),
      checkOut: new Date('2027-01-12'),
      daysCount: 2,
      pricePerDay: 100,
      bookingAmount: 200,
      vat: 10,
      vatAmount: 20,
      totalAmount: 220,
      currency: 'EGP',
      adultsCount: 2,
      kidsCount: 0,
      status: 'PENDING',
      createdAt: new Date('2026-11-17T10:00:00.000Z'),
      updatedAt: new Date('2026-11-17T10:00:00.000Z'),
    };
    const exec = jest.fn().mockResolvedValue(booking);
    const populate = jest.fn().mockReturnThis();
    const findById = jest.fn().mockReturnValue({ populate, exec });
    const model = { findById } as unknown as Model<Booking>;
    const repository = new MongooseBookingAvailabilityRepository(
      model,
      {} as Model<import('@infrastructure/users/schemas/user.schema').User>,
      {} as Model<import('@infrastructure/units/schemas/units.schema').Unit>,
    );

    const result = await repository.findById(id.toString());

    expect(findById).toHaveBeenCalledWith(id.toString());
    expect(result).toMatchObject({
      id: id.toString(),
      unit: booking.unit.toString(),
      guest: booking.guest.toString(),
      host: booking.host.toString(),
      totalAmount: 220,
    });
  });

  it('keeps a booking readable when a populated related document was deleted', async () => {
    const id = new Types.ObjectId('670d1234567890abcdef123a');
    const booking = {
      _id: id,
      unit: null,
      guest: null,
      host: null,
      checkIn: new Date('2027-01-10'),
      checkOut: new Date('2027-01-12'),
      daysCount: 2,
      pricePerDay: 100,
      bookingAmount: 200,
      vat: 10,
      vatAmount: 20,
      totalAmount: 220,
      currency: 'EGP',
      adultsCount: 2,
      kidsCount: 0,
      status: 'PENDING',
      createdAt: new Date('2026-11-17T10:00:00.000Z'),
      updatedAt: new Date('2026-11-17T10:00:00.000Z'),
    };
    const exec = jest.fn().mockResolvedValue(booking);
    const model = {
      findById: jest.fn().mockReturnValue({ populate: jest.fn().mockReturnThis(), exec }),
    } as unknown as Model<Booking>;
    const repository = new MongooseBookingAvailabilityRepository(
      model,
      {} as Model<import('@infrastructure/users/schemas/user.schema').User>,
      {} as Model<import('@infrastructure/units/schemas/units.schema').Unit>,
    );

    const result = await repository.findById(id.toString());

    expect(result).toMatchObject({ id: id.toString(), unit: '', guest: '', host: '' });
  });
});
