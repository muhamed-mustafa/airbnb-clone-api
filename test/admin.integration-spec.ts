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
import { TOKEN_SERVICE_TOKEN } from '../src/application/auth/services/token-service.token';
import type { TokenService } from '../src/application/auth/services/token.service';
import { Roles } from '../src/common/constants/roles.constant';
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

  // Admin endpoints require an admin access token (JwtAuthGuard + RolesGuard).
  let adminToken = '';
  const asAdmin = (path: string) =>
    request(app!.getHttpServer()).get(path).set('Authorization', `Bearer ${adminToken}`);

  // Distinct, recognizable stored values: none of them may ever appear in a response.
  const storedPasswords = ['stored-password-value-1', 'stored-password-value-2'];

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

    adminToken = await moduleFixture
      .get<TokenService>(TOKEN_SERVICE_TOKEN)
      .generateAccessToken({ id: primaryId, role: Roles.ADMIN });

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
        password: storedPasswords[0],
        isSuperAdmin: true,
      },
      {
        _id: secondaryId,
        name: 'Bob Admin',
        email: 'bob@example.com',
        password: storedPasswords[1],
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
      await asAdmin('/api/admins')
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

    it('never leaks the password field: every item has exactly the public fields', async () => {
      await asAdmin('/api/admins')
        .expect(200)
        .expect(({ text, body }: { text: string; body: { data: object[] } }) => {
          expect(body.data).toHaveLength(2);
          for (const item of body.data) {
            expect(Object.keys(item).sort()).toEqual(['email', 'id', 'isSuperAdmin', 'name']);
          }
          expect(text).not.toContain('password');
          for (const stored of storedPasswords) expect(text).not.toContain(stored);
        });
    });

    it('filters by email (exact match)', async () => {
      await asAdmin('/api/admins')
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
      await asAdmin('/api/admins')
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
        await asAdmin('/api/admins').query(query).expect(400);
      },
    );
  });

  describe('GET /api/admins/:id', () => {
    it('returns an admin by id', async () => {
      await asAdmin(`/api/admins/${primaryId}`)
        .expect(200)
        .expect({
          data: {
            id: primaryId,
            name: 'Alice Admin',
            email: 'alice@example.com',
            isSuperAdmin: true,
          },
        });
    });

    it('never leaks the password field', async () => {
      await asAdmin(`/api/admins/${primaryId}`)
        .expect(200)
        .expect(({ text }: { text: string }) => {
          expect(text).not.toContain('password');
          expect(text).not.toContain(storedPasswords[0]);
        });
    });

    it('returns 404 for a missing admin', async () => {
      await asAdmin(`/api/admins/${missingId}`)
        .expect(404)
        .expect(({ body }: { body: unknown }) => {
          expect(body).toMatchObject({ code: 'ADMIN_NOT_FOUND' });
        });
    });

    it('returns 400 for an invalid id', async () => {
      await asAdmin('/api/admins/invalid').expect(400);
    });

    it('returns 404 for a soft-deleted admin', async () => {
      await connection!
        .model(Admin.name)
        .updateOne({ _id: primaryId }, { $set: { isDeleted: true, deletedAt: new Date() } });

      await asAdmin(`/api/admins/${primaryId}`)
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
        .expect(
          ({ body }: { body: { data: { accessToken?: unknown; refreshToken?: unknown } } }) => {
            expect(typeof body.data.accessToken).toBe('string');
            expect(typeof body.data.refreshToken).toBe('string');
          },
        );
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

    describe('refresh tokens issued within the same second', () => {
      interface Tokens {
        accessToken: string;
        refreshToken: string;
      }

      const signIn = async (): Promise<Tokens> => {
        const response = await request(app!.getHttpServer())
          .post('/api/auth/admin/login')
          .send({ email: loginEmail, password: loginPassword })
          .expect(200);
        return (response.body as { data: Tokens }).data;
      };
      const refresh = (token: string) =>
        request(app!.getHttpServer()).post('/api/auth/refresh-token').send({ token });
      const issuedAt = (token: string) =>
        (JSON.parse(Buffer.from(token.split('.')[1], 'base64url').toString()) as { iat: number })
          .iat;
      const startOfNextSecond = () =>
        new Promise((resolve) => setTimeout(resolve, 1000 - (Date.now() % 1000) + 20));

      /** Issues from the start of a second until all tokens share one `iat` (max 3 tries). */
      async function withinOneSecond<T>(issue: () => Promise<T>, tokensOf: (r: T) => string[]) {
        for (let attempt = 1; attempt <= 3; attempt++) {
          await startOfNextSecond();
          const result = await issue();
          if (new Set(tokensOf(result).map(issuedAt)).size === 1) return result;
        }
        throw new Error('could not issue the tokens within one second in 3 attempts');
      }

      // Tokens are compared as booleans so a failure never prints one.
      it('a newer sign-in revokes the earlier refresh token', async () => {
        const [first, second] = await withinOneSecond(
          async () => [await signIn(), await signIn()] as const,
          ([a, b]) => [a.refreshToken, b.refreshToken],
        );

        expect(first.refreshToken === second.refreshToken).toBe(false);
        await refresh(first.refreshToken).expect(401);
        await refresh(second.refreshToken).expect(200);
      }, 15000);

      it('a rotation returns a new refresh token and rejects the one it replaced', async () => {
        const { signedIn, rotated } = await withinOneSecond(
          async () => {
            const signedIn = await signIn();
            const response = await refresh(signedIn.refreshToken).expect(200);
            return { signedIn, rotated: (response.body as { data: Tokens }).data };
          },
          ({ signedIn, rotated }) => [signedIn.refreshToken, rotated.refreshToken],
        );

        expect(signedIn.refreshToken === rotated.refreshToken).toBe(false);
        await refresh(signedIn.refreshToken).expect(401);
        await refresh(rotated.refreshToken).expect(200);
      }, 15000);
    });
  });
});
