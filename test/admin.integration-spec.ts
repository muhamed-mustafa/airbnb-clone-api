import { INestApplication } from '@nestjs/common';
import { getConnectionToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import * as argon2 from 'argon2';
import { Connection, ConnectionStates, createConnection } from 'mongoose';
import { I18nMiddleware, I18nValidationPipe } from 'nestjs-i18n';
import { randomUUID } from 'node:crypto';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app/app.module';
import { Admin, AdminSchema } from '../src/infrastructure/admin/schemas/admin.schema';

// Opt-in integration suite: always uses a newly generated database, never the URI's database.
describe('Admin HTTP API with MongoDB', () => {
  let app: INestApplication<App> | undefined;
  let moduleFixture: TestingModule | undefined;
  let connection: Connection | undefined;

  const databaseName = `admin_test_${randomUUID().replaceAll('-', '')}`;

  const primaryId = '670d1234567890abcdef1234';
  const secondaryId = '670d1234567890abcdef1235';
  const missingId = '670d1234567890abcdef1236';

  let initialSuperAdmin: { name: string; email: string; isSuperAdmin: boolean } | null = null;

  const loginAdminId = '670d1234567890abcdef1240';
  const loginEmail = 'login-admin@example.com';
  const loginPassword = 'Login123!';
  let loginPasswordHash = '';

  beforeAll(async () => {
    const uri = process.env.ADMIN_TEST_MONGO_URI;

    if (!uri) {
      throw new Error('Set ADMIN_TEST_MONGO_URI to a local/test MongoDB server.');
    }

    connection = await createConnection(uri, {
      dbName: databaseName,
      serverSelectionTimeoutMS: 5000,
    }).asPromise();

    const model = connection.model(Admin.name, AdminSchema);
    await model.init();

    loginPasswordHash = await argon2.hash(loginPassword);

    moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(getConnectionToken())
      .useValue(connection)
      .compile();

    app = moduleFixture.createNestApplication<INestApplication<App>>();

    app.useGlobalPipes(
      new I18nValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: true,
      }),
    );

    app.use(I18nMiddleware);
    app.setGlobalPrefix('api');

    await app.init();

    // onModuleInit has now run during bootstrap and should have created the super admin.
    const created = await connection.model<Admin>(Admin.name).findOne({ isSuperAdmin: true });

    initialSuperAdmin = created
      ? { name: created.name, email: created.email, isSuperAdmin: created.isSuperAdmin }
      : null;
  }, 30000);

  beforeEach(async () => {
    const model = connection!.model(Admin.name);

    await model.deleteMany({});

    await model.create([
      {
        _id: primaryId,
        name: 'Alice Admin',
        email: 'alice@example.com',
        password: 'hashed-password-1',
        isSuperAdmin: true,
      },
      {
        _id: secondaryId,
        name: 'Bob Admin',
        email: 'bob@example.com',
        password: 'hashed-password-2',
        isSuperAdmin: false,
      },
    ]);
  });

  afterAll(async () => {
    try {
      if (
        connection?.readyState === ConnectionStates.connected &&
        connection.name === databaseName
      ) {
        await connection.dropDatabase();
      }
    } finally {
      await (app ?? moduleFixture)?.close();
      await connection?.close();
    }
  });

  describe('onModuleInit bootstrap', () => {
    it('creates the initial super admin on application startup', () => {
      expect(initialSuperAdmin).not.toBeNull();
      expect(initialSuperAdmin?.isSuperAdmin).toBe(true);
      expect(initialSuperAdmin?.email).toEqual(expect.any(String));
      expect(initialSuperAdmin?.name).toEqual(expect.any(String));
    });
  });

  describe('GET /api/admins', () => {
    it('returns a paginated list of admins in name order', async () => {
      await request(app!.getHttpServer())
        .get('/api/admins')
        .expect(200)
        .expect({
          data: [
            { id: primaryId, name: 'Alice Admin', email: 'alice@example.com', isSuperAdmin: true },
            { id: secondaryId, name: 'Bob Admin', email: 'bob@example.com', isSuperAdmin: false },
          ],
          meta: {
            page: 1,
            limit: 10,
            total: 2,
            totalPages: 1,
            hasNextPage: false,
            hasPreviousPage: false,
          },
        });
    });

    it('never leaks the password field', async () => {
      await request(app!.getHttpServer())
        .get('/api/admins')
        .expect(200)
        .expect(({ text }: { text: string }) => {
          expect(text).not.toContain('password');
        });
    });

    it('filters by email (exact match)', async () => {
      await request(app!.getHttpServer())
        .get('/api/admins')
        .query({ email: 'alice@example.com' })
        .expect(200)
        .expect({
          data: [
            { id: primaryId, name: 'Alice Admin', email: 'alice@example.com', isSuperAdmin: true },
          ],
          meta: {
            page: 1,
            limit: 10,
            total: 1,
            totalPages: 1,
            hasNextPage: false,
            hasPreviousPage: false,
          },
        });
    });

    it('paginates in name order', async () => {
      await request(app!.getHttpServer())
        .get('/api/admins')
        .query({ page: 2, limit: 1 })
        .expect(200)
        .expect({
          data: [
            { id: secondaryId, name: 'Bob Admin', email: 'bob@example.com', isSuperAdmin: false },
          ],
          meta: {
            page: 2,
            limit: 1,
            total: 2,
            totalPages: 2,
            hasNextPage: false,
            hasPreviousPage: true,
          },
        });
    });

    it.each([{ limit: 101 }, { limit: 0 }, { page: -1 }, { page: 1.5 }])(
      'rejects invalid pagination: %j',
      async (query) => {
        await request(app!.getHttpServer()).get('/api/admins').query(query).expect(400);
      },
    );
  });

  describe('GET /api/admins/:id', () => {
    it('returns an admin by id', async () => {
      await request(app!.getHttpServer()).get(`/api/admins/${primaryId}`).expect(200).expect({
        id: primaryId,
        name: 'Alice Admin',
        email: 'alice@example.com',
        isSuperAdmin: true,
      });
    });

    it('returns 404 for a missing admin', async () => {
      await request(app!.getHttpServer())
        .get(`/api/admins/${missingId}`)
        .expect(404)
        .expect(({ body }: { body: unknown }) => {
          expect(body).toMatchObject({ code: 'ADMIN_NOT_FOUND' });
        });
    });

    it('returns 400 for an invalid id', async () => {
      await request(app!.getHttpServer()).get('/api/admins/invalid').expect(400);
    });

    it('returns 404 for a soft-deleted admin', async () => {
      await connection!
        .model(Admin.name)
        .updateOne({ _id: primaryId }, { $set: { isDeleted: true, deletedAt: new Date() } });

      await request(app!.getHttpServer())
        .get(`/api/admins/${primaryId}`)
        .expect(404)
        .expect(({ body }: { body: unknown }) => {
          expect(body).toMatchObject({ code: 'ADMIN_NOT_FOUND' });
        });
    });
  });

  describe('POST /api/auth/admin/login', () => {
    beforeEach(async () => {
      await connection!.model(Admin.name).create({
        _id: loginAdminId,
        name: 'Login Admin',
        email: loginEmail,
        password: loginPasswordHash,
        isSuperAdmin: true,
      });
    });

    it('returns access and refresh tokens for valid credentials', async () => {
      await request(app!.getHttpServer())
        .post('/api/auth/admin/login')
        .send({ email: loginEmail, password: loginPassword })
        .expect(200)
        .expect(({ body }: { body: { accessToken?: unknown; refreshToken?: unknown } }) => {
          expect(typeof body.accessToken).toBe('string');
          expect(typeof body.refreshToken).toBe('string');
        });
    });

    it('rejects an invalid password with 401', async () => {
      await request(app!.getHttpServer())
        .post('/api/auth/admin/login')
        .send({ email: loginEmail, password: 'WrongPassword1!' })
        .expect(401)
        .expect(({ body }: { body: unknown }) => {
          expect(body).toMatchObject({ code: 'INVALID_CREDENTIALS' });
        });
    });

    it('rejects an unknown email with 401', async () => {
      await request(app!.getHttpServer())
        .post('/api/auth/admin/login')
        .send({ email: 'nobody@example.com', password: loginPassword })
        .expect(401)
        .expect(({ body }: { body: unknown }) => {
          expect(body).toMatchObject({ code: 'INVALID_CREDENTIALS' });
        });
    });

    it.each([
      { password: loginPassword },
      { email: 'not-an-email', password: loginPassword },
      { email: loginEmail },
      { email: loginEmail, password: loginPassword, extra: 'nope' },
    ])('rejects invalid login payloads: %j', async (payload) => {
      await request(app!.getHttpServer()).post('/api/auth/admin/login').send(payload).expect(400);
    });
  });
});
