import { Test } from '@nestjs/testing';
import { type INestApplication, UnauthorizedException, ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import request from 'supertest';
import type { App } from 'supertest/types';
import { AuthController } from '../auth/auth.controller';
import { AdminController } from '../admin/admin.controller';
import { AdminAuthController } from '../admin/admin-auth.controller';
import { AppSettingsController } from '../app-settings/app-settings.controller';
import { AuthService } from '@application/auth/services/auth.service';
import { LogoutUseCase } from '@application/auth/use-cases/logout.usecase';
import { ChangeMyPasswordUseCase } from '@application/auth/use-cases/change-my-password.usecase';
import { CustomerPasswordResetUseCase } from '@application/auth/use-cases/customer-password-reset.usecase';
import { CustomerActivationUseCase } from '@application/auth/use-cases/customer-activation.usecase';
import { AdminService } from '@application/admin/services/admin.service';
import { AppSettingsService } from '@application/app-settings/services/app-settings.service';
import { TOKEN_SERVICE_TOKEN } from '@application/auth/services/token-service.token';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { TransformResponseInterceptor } from '@common/interceptors/transform-response.interceptor';
import { I18nService } from 'nestjs-i18n';
import { BookingsController } from '../bookings/bookings.controller';
import { BookingService } from '@application/bookings/services/booking.service';
import { UnitsController } from '../units/units.controller';
import { UnitService } from '@application/units/services/unit.service';
import { UnitReviewsController } from '../bookings/unit-reviews.controller';

describe('HTTP route contract with actual authorization guards', () => {
  let app: INestApplication<App>;
  const tokens = { accessToken: 'access', refreshToken: 'refresh' };
  const credentials = { email: 'api@example.com', password: 'Password123!' };
  const emptyBookingPage = {
    data: [],
    meta: {
      page: 1,
      limit: 10,
      total: 0,
      totalPages: 0,
      hasNextPage: false,
      hasPreviousPage: false,
    },
  };
  const findAllBookings = jest.fn().mockResolvedValue(emptyBookingPage);
  const findMyBookings = jest.fn().mockResolvedValue(emptyBookingPage);
  const bookingId = '670d1234567890abcdef123a';
  const findBookingById = jest.fn().mockResolvedValue({
    id: bookingId,
    unit: '670d1234567890abcdef1237',
    guest: 'principal-id',
    host: '670d1234567890abcdef1239',
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
  });
  const bookingMutationResult = {
    id: bookingId,
    unit: '670d1234567890abcdef1237',
    guest: 'principal-id',
    host: '670d1234567890abcdef1239',
    checkIn: new Date('2027-01-10T00:00:00.000Z'),
    checkOut: new Date('2027-01-12T00:00:00.000Z'),
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
  const updateBookingRequest = jest.fn().mockResolvedValue(bookingMutationResult);
  const cancelBooking = jest
    .fn()
    .mockResolvedValue({ ...bookingMutationResult, status: 'CANCELLED' });
  const updateBookingStatus = jest
    .fn()
    .mockResolvedValue({ ...bookingMutationResult, status: 'CONFIRMED' });
  const createBookingReview = jest.fn().mockResolvedValue({
    id: '670d1234567890abcdef123b',
    guestName: 'Guest',
    rating: 5,
    createdAt: new Date(),
  });
  const findUnitReviews = jest.fn().mockResolvedValue({
    items: [],
    ratingAverage: 4.5,
    ratingsCount: 2,
    meta: {
      page: 1,
      limit: 10,
      total: 0,
      totalPages: 0,
      hasNextPage: false,
      hasPreviousPage: false,
    },
  });
  const adminUnit = {
    id: '670d1234567890abcdef1237',
    user: '670d1234567890abcdef1238',
    title: 'Quiet apartment',
    description: 'A comfortable apartment.',
    address: 'Alexandria',
    photos: ['https://example.test/photo.jpg'],
    costPerDay: 120,
    country: '670d1234567890abcdef1234',
    city: '670d1234567890abcdef1235',
    unitCategory: '670d1234567890abcdef1236',
    roomsCount: 2,
    adultsCount: 4,
    kidsCount: 1,
    hasInternetService: true,
    hasKitchen: true,
    hasPrivateGarage: false,
    availability: true,
    isActive: false,
    version: 1,
  };
  const findAllUnits = jest.fn().mockResolvedValue({
    data: [adminUnit],
    meta: {
      page: 1,
      limit: 10,
      total: 1,
      totalPages: 1,
      hasNextPage: false,
      hasPreviousPage: false,
    },
  });
  const findOneUnit = jest.fn().mockResolvedValue(adminUnit);
  const requestCustomerReset = jest.fn().mockResolvedValue(undefined);
  const verifyCustomerReset = jest.fn().mockResolvedValue({ resetToken: 'a'.repeat(43) });
  const completeCustomerReset = jest.fn().mockResolvedValue(undefined);
  const resendActivation = jest.fn().mockResolvedValue(undefined);
  const verifyActivation = jest.fn().mockResolvedValue(tokens);

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      controllers: [
        AuthController,
        AdminController,
        AdminAuthController,
        AppSettingsController,
        BookingsController,
        UnitsController,
        UnitReviewsController,
      ],
      providers: [
        { provide: LogoutUseCase, useValue: { execute: jest.fn() } },
        { provide: ChangeMyPasswordUseCase, useValue: { execute: jest.fn() } },
        {
          provide: CustomerActivationUseCase,
          useValue: { issue: resendActivation, verify: verifyActivation },
        },
        {
          provide: CustomerPasswordResetUseCase,
          useValue: {
            request: requestCustomerReset,
            verify: verifyCustomerReset,
            complete: completeCustomerReset,
          },
        },
        JwtAuthGuard,
        RolesGuard,
        { provide: I18nService, useValue: { translate: (key: string) => key } },
        {
          provide: BookingService,
          useValue: {
            findAll: findAllBookings,
            findMyBookings,
            findById: findBookingById,
            updateRequestByGuest: updateBookingRequest,
            cancelByGuest: cancelBooking,
            updateStatusByHost: updateBookingStatus,
            createReview: createBookingReview,
            findUnitReviews,
          },
        },
        { provide: UnitService, useValue: { findAll: findAllUnits, findOne: findOneUnit } },
        {
          provide: AuthService,
          useValue: {
            login: jest.fn().mockResolvedValue(tokens),
            register: jest
              .fn()
              .mockResolvedValue({ email: 'api@example.com', verificationRequired: true }),
            refreshToken: jest.fn().mockResolvedValue(tokens),
          },
        },
        {
          provide: AdminService,
          useValue: {
            login: jest.fn().mockResolvedValue(tokens),
            findAll: jest.fn().mockResolvedValue({ data: [], meta: { total: 0 } }),
            findOne: jest
              .fn()
              .mockResolvedValue({ id: 'admin-id', name: 'Admin', email: credentials.email }),
          },
        },
        {
          provide: AppSettingsService,
          useValue: {
            findOne: jest.fn().mockResolvedValue({ vatRate: 10, minPrice: 100 }),
            upsert: jest.fn().mockResolvedValue({ vatRate: 15, minPrice: 100 }),
          },
        },
        {
          provide: TOKEN_SERVICE_TOKEN,
          useValue: {
            verifyAccessToken: (token: string) => {
              if (!['admin', 'user'].includes(token)) throw new UnauthorizedException();
              return Promise.resolve({ id: 'principal-id', role: token });
            },
          },
        },
      ],
    }).compile();
    app = module.createNestApplication();
    app.setGlobalPrefix('api');
    app.useGlobalPipes(
      new ValidationPipe({ transform: true, whitelist: true, forbidNonWhitelisted: true }),
    );
    app.useGlobalInterceptors(new TransformResponseInterceptor());
    app.useGlobalGuards(module.get(JwtAuthGuard), module.get(RolesGuard));
    await app.init();
  });
  afterAll(async () => {
    await app.close();
  });

  it.each(['/api/auth/login', '/api/auth/admin/login', '/api/auth/refresh-token'])(
    'returns 200 for token issuance at %s',
    async (path) => {
      const body = path.endsWith('/refresh-token') ? { token: 'refresh' } : credentials;
      await request(app.getHttpServer()).post(path).send(body).expect(200).expect({ data: tokens });
    },
  );
  it('returns a pending account without tokens for registration', async () => {
    await request(app.getHttpServer())
      .post('/api/auth/register')
      .send({ ...credentials, name: 'User', countryCode: '+20', phone: '1555738344' })
      .expect(201)
      .expect({ data: { email: 'api@example.com', verificationRequired: true } });
  });
  it('validates public activation routes and only returns tokens after verification', async () => {
    await request(app.getHttpServer())
      .post('/api/auth/activation/resend')
      .send({ email: 'bad' })
      .expect(400);
    await request(app.getHttpServer())
      .post('/api/auth/activation/resend')
      .send({ email: 'guest@example.com', language: 'en' })
      .expect(200)
      .expect(({ body }) => expect(body).not.toHaveProperty('data.accessToken'));
    expect(resendActivation).toHaveBeenCalledWith('guest@example.com', 'en');
    await request(app.getHttpServer())
      .post('/api/auth/activation/verify')
      .send({ email: 'guest@example.com', code: '12345' })
      .expect(400);
    await request(app.getHttpServer())
      .post('/api/auth/activation/verify')
      .send({ email: 'guest@example.com', code: '123456' })
      .expect(200)
      .expect({ data: tokens });
    expect(verifyActivation).toHaveBeenCalledWith('guest@example.com', '123456');
  });
  it('exposes public customer recovery with validated input and no automatic login', async () => {
    await request(app.getHttpServer())
      .post('/api/auth/password-reset/request')
      .send({ email: 'bad' })
      .expect(400);
    await request(app.getHttpServer())
      .post('/api/auth/password-reset/request')
      .send({ email: 'guest@example.com', language: 'ar' })
      .expect(200);
    expect(requestCustomerReset).toHaveBeenCalledWith('guest@example.com', 'ar');
    await request(app.getHttpServer())
      .post('/api/auth/password-reset/verify')
      .send({ email: 'guest@example.com', code: '12345' })
      .expect(400);
    await request(app.getHttpServer())
      .post('/api/auth/password-reset/verify')
      .send({ email: 'guest@example.com', code: '123456' })
      .expect(200)
      .expect({ data: { resetToken: 'a'.repeat(43) } });
    expect(verifyCustomerReset).toHaveBeenCalledWith('guest@example.com', '123456');
    await request(app.getHttpServer())
      .post('/api/auth/password-reset/complete')
      .send({ resetToken: 'a'.repeat(43), newPassword: 'short' })
      .expect(400);
    await request(app.getHttpServer())
      .post('/api/auth/password-reset/complete')
      .send({ resetToken: 'a'.repeat(43), newPassword: 'secure-new-password' })
      .expect(204);
    expect(completeCustomerReset).toHaveBeenCalledWith('a'.repeat(43), 'secure-new-password');
  });
  it.each(['/api/admins', '/api/admins/670d1234567890abcdef1238', '/api/app-settings'])(
    'requires an admin role for GET %s',
    async (path) => {
      await request(app.getHttpServer()).get(path).expect(401);
      await request(app.getHttpServer()).get(path).set('Authorization', 'Bearer user').expect(403);
      await request(app.getHttpServer()).get(path).set('Authorization', 'Bearer admin').expect(200);
    },
  );
  it('accepts PATCH for partial settings updates and requires admin authorization', async () => {
    await request(app.getHttpServer()).patch('/api/app-settings').send({ vatRate: 15 }).expect(401);
    await request(app.getHttpServer())
      .patch('/api/app-settings')
      .set('Authorization', 'Bearer user')
      .send({ vatRate: 15 })
      .expect(403);
    await request(app.getHttpServer())
      .patch('/api/app-settings')
      .set('Authorization', 'Bearer admin')
      .send({ vatRate: 15 })
      .expect(200)
      .expect({ data: { vatRate: 15, minPrice: 100 } });
  });
  it('keeps shared identity accessible to both roles', async () => {
    for (const role of ['user', 'admin']) {
      await request(app.getHttpServer())
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${role}`)
        .expect(200)
        .expect({ data: { id: 'principal-id', role } });
    }
  });
  it('keeps booking lists scoped to their intended roles', async () => {
    await request(app.getHttpServer()).get('/api/bookings/admin').expect(401);
    await request(app.getHttpServer())
      .get('/api/bookings/admin')
      .set('Authorization', 'Bearer user')
      .expect(403);
    await request(app.getHttpServer())
      .get('/api/bookings/admin')
      .set('Authorization', 'Bearer admin')
      .expect(200);

    await request(app.getHttpServer()).get('/api/bookings/me').expect(401);
    await request(app.getHttpServer())
      .get('/api/bookings/me')
      .set('Authorization', 'Bearer admin')
      .expect(403);
    await request(app.getHttpServer())
      .get('/api/bookings/me')
      .set('Authorization', 'Bearer user')
      .expect(200);
  });
  it('allows a signed-in user to fetch a booking by id through the participant-scoped service', async () => {
    await request(app.getHttpServer()).get(`/api/bookings/${bookingId}`).expect(401);
    await request(app.getHttpServer())
      .get(`/api/bookings/${bookingId}`)
      .set('Authorization', 'Bearer admin')
      .expect(403);
    await request(app.getHttpServer())
      .get(`/api/bookings/${bookingId}`)
      .set('Authorization', 'Bearer user')
      .expect(200)
      .expect(({ body }) => expect(body).toHaveProperty('data.id', bookingId));
    expect(findBookingById).toHaveBeenCalledWith(bookingId, 'principal-id');
    await request(app.getHttpServer())
      .get('/api/bookings/not-an-id')
      .set('Authorization', 'Bearer user')
      .expect(400);
  });
  it('enforces authentication, validation, and booking mutation routes', async () => {
    const checkOut = new Date('2027-01-13T00:00:00.000Z');
    await request(app.getHttpServer())
      .patch(`/api/bookings/${bookingId}`)
      .send({ notes: 'Updated' })
      .expect(401);
    await request(app.getHttpServer())
      .patch(`/api/bookings/${bookingId}`)
      .set('Authorization', 'Bearer admin')
      .send({ notes: 'Updated' })
      .expect(403);
    await request(app.getHttpServer())
      .patch(`/api/bookings/${bookingId}`)
      .set('Authorization', 'Bearer user')
      .send({ checkOut: '2027-01-13', notes: 'Updated' })
      .expect(200);
    expect(updateBookingRequest).toHaveBeenCalledWith(
      bookingId,
      'principal-id',
      expect.objectContaining({ checkOut, notes: 'Updated' }),
    );

    await request(app.getHttpServer())
      .patch(`/api/bookings/${bookingId}/cancel`)
      .set('Authorization', 'Bearer user')
      .send({ reason: 'Plans changed' })
      .expect(200);
    expect(cancelBooking).toHaveBeenCalledWith(bookingId, 'principal-id', {
      reason: 'Plans changed',
    });

    await request(app.getHttpServer())
      .patch(`/api/bookings/${bookingId}/status`)
      .set('Authorization', 'Bearer user')
      .send({ status: 'CONFIRMED' })
      .expect(200);
    expect(updateBookingStatus).toHaveBeenCalledWith(bookingId, 'principal-id', 'CONFIRMED');
    await request(app.getHttpServer())
      .patch(`/api/bookings/${bookingId}/status`)
      .set('Authorization', 'Bearer user')
      .send({ status: 'CANCELLED' })
      .expect(400);
    await request(app.getHttpServer())
      .patch('/api/bookings/not-an-id/cancel')
      .set('Authorization', 'Bearer user')
      .send({})
      .expect(400);
  });
  it('exposes guest review and public paginated unit-review routes with validation and auth', async () => {
    await request(app.getHttpServer())
      .post(`/api/bookings/${bookingId}/review`)
      .send({ rating: 5 })
      .expect(401);
    await request(app.getHttpServer())
      .post(`/api/bookings/${bookingId}/review`)
      .set('Authorization', 'Bearer admin')
      .send({ rating: 5 })
      .expect(403);
    await request(app.getHttpServer())
      .post(`/api/bookings/${bookingId}/review`)
      .set('Authorization', 'Bearer user')
      .send({ rating: 6 })
      .expect(400);
    await request(app.getHttpServer())
      .post(`/api/bookings/${bookingId}/review`)
      .set('Authorization', 'Bearer user')
      .send({ rating: 5, comment: 'Great stay' })
      .expect(201);
    expect(createBookingReview).toHaveBeenCalledWith(bookingId, 'principal-id', {
      rating: 5,
      comment: 'Great stay',
    });

    await request(app.getHttpServer())
      .get('/api/units/670d1234567890abcdef1237/reviews')
      .query({ page: '2', limit: '5' })
      .expect(200);
    expect(findUnitReviews).toHaveBeenCalledWith('670d1234567890abcdef1237', 2, 5);
    await request(app.getHttpServer()).get('/api/units/not-an-id/reviews').expect(400);
  });
  it('applies the admin and self-service booking filters from query parameters', async () => {
    await request(app.getHttpServer())
      .get('/api/bookings/admin')
      .set('Authorization', 'Bearer admin')
      .query({
        page: '2',
        limit: '25',
        status: 'CONFIRMED',
        search: 'Mohamed',
        checkInFrom: '2027-01-01',
        checkInTo: '2027-01-31',
        createdFrom: '2027-02-01',
        createdTo: '2027-02-28',
      })
      .expect(200);

    expect(findAllBookings).toHaveBeenCalledWith({
      page: 2,
      limit: 25,
      status: 'CONFIRMED',
      search: 'Mohamed',
      checkInFrom: new Date('2027-01-01'),
      checkInTo: new Date('2027-01-31'),
      createdFrom: new Date('2027-02-01'),
      createdTo: new Date('2027-02-28'),
    });

    await request(app.getHttpServer())
      .get('/api/bookings/me')
      .set('Authorization', 'Bearer user')
      .query({ page: '3', limit: '5', party: 'host', status: 'PENDING' })
      .expect(200);

    expect(findMyBookings).toHaveBeenCalledWith('principal-id', {
      page: 3,
      limit: 5,
      party: 'host',
      status: 'PENDING',
    });

    await request(app.getHttpServer())
      .get('/api/bookings/me')
      .set('Authorization', 'Bearer user')
      .query({ guest: '670d1234567890abcdef1240' })
      .expect(400);

    await request(app.getHttpServer())
      .get('/api/bookings/me')
      .set('Authorization', 'Bearer user')
      .query({ checkInFrom: '2027-02-01', checkInTo: '2027-01-01' })
      .expect(400);
  });
  it('keeps admin unit browsing protected and includes inactive units', async () => {
    await request(app.getHttpServer()).get('/api/units/admin').expect(401);
    await request(app.getHttpServer())
      .get('/api/units/admin')
      .set('Authorization', 'Bearer user')
      .expect(403);
    await request(app.getHttpServer())
      .get('/api/units/admin')
      .set('Authorization', 'Bearer admin')
      .query({ page: '2', title: 'sea view', isActive: 'false', minPrice: '100' })
      .expect(200);
    expect(findAllUnits).toHaveBeenCalledWith(
      expect.objectContaining({ page: 2, title: 'sea view', isActive: false, minPrice: 100 }),
    );

    await request(app.getHttpServer())
      .get(`/api/units/admin/${adminUnit.id}`)
      .set('Authorization', 'Bearer admin')
      .expect(200)
      .expect(({ body }) => expect(body).toHaveProperty('data.isActive', false));
    expect(findOneUnit).toHaveBeenCalledWith({ id: adminUnit.id });
  });
  it('removes old routes and keeps OpenAPI consistent with HTTP responses', async () => {
    await request(app.getHttpServer()).post('/api/admin/login').send(credentials).expect(404);
    await request(app.getHttpServer()).get('/api/admin').expect(404);
    await request(app.getHttpServer()).put('/api/app-settings').send({ vatRate: 15 }).expect(404);
    const spec = SwaggerModule.createDocument(app, new DocumentBuilder().build());
    expect(spec.paths['/api/auth/admin/login']?.post?.responses['200']).toBeDefined();
    expect(spec.paths['/api/auth/admin/login']?.post?.responses['201']).toBeUndefined();
    expect(spec.paths['/api/app-settings']?.patch?.security).toContainEqual({ 'access-token': [] });
    expect(spec.paths['/api/app-settings']?.put).toBeUndefined();
    expect(spec.paths['/api/bookings/admin']?.get?.responses['200']).toBeDefined();
    const bookingSearchParameters = spec.paths['/api/bookings/admin']?.get?.parameters ?? [];
    expect(bookingSearchParameters).toEqual(
      expect.arrayContaining([expect.objectContaining({ name: 'search', in: 'query' })]),
    );
    expect(
      bookingSearchParameters.map((parameter) =>
        'name' in parameter ? parameter.name : undefined,
      ),
    ).not.toEqual(expect.arrayContaining(['unit', 'guest', 'host']));
    expect(spec.components?.schemas?.BookingListResponseDto).toHaveProperty('properties.guestName');
    expect(spec.paths['/api/bookings/me']?.get?.responses['200']).toBeDefined();
    expect(spec.paths['/api/bookings/{id}']?.get?.responses['200']).toBeDefined();
    expect(spec.paths['/api/bookings/{id}']?.patch?.operationId).toBe(
      'bookingsUpdateRequestByGuest',
    );
    expect(spec.paths['/api/bookings/{id}/cancel']?.patch?.operationId).toBe(
      'bookingsCancelByGuest',
    );
    expect(spec.paths['/api/bookings/{id}/status']?.patch?.operationId).toBe(
      'bookingsUpdateStatusByHost',
    );
    expect(spec.paths['/api/bookings/{id}/review']?.post?.operationId).toBe('bookingsCreateReview');
    expect(spec.paths['/api/units/{id}/reviews']?.get?.operationId).toBe('unitsFindReviews');
    expect(spec.components?.schemas?.CreateBookingReviewDto).toHaveProperty(
      'properties.rating.maximum',
      5,
    );
    expect(spec.components?.schemas?.UpdateBookingStatusDto).toHaveProperty(
      'properties.status.enum',
      ['CONFIRMED', 'DECLINED'],
    );
    expect(spec.paths['/api/bookings/me']?.get?.parameters).toEqual(
      expect.arrayContaining([expect.objectContaining({ name: 'party', in: 'query' })]),
    );
    expect(spec.paths['/api/units/admin']?.get?.responses['200']).toBeDefined();
    expect(spec.paths['/api/units/admin/{id}']?.get?.responses['200']).toBeDefined();
    expect(spec.paths['/api/units/admin']?.get?.parameters).toEqual(
      expect.arrayContaining([expect.objectContaining({ name: 'isActive', in: 'query' })]),
    );
  });
});
