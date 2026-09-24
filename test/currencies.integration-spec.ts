import { INestApplication } from '@nestjs/common';
import { getConnectionToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { Connection, ConnectionStates, createConnection } from 'mongoose';
import { I18nMiddleware, I18nValidationPipe } from 'nestjs-i18n';
import { randomUUID } from 'node:crypto';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app/app.module';
import {
  Currency,
  CurrencySchema,
} from '../src/infrastructure/currencies/schemas/currencies.schema';

// Opt-in integration suite: always uses a newly generated database, never the URI's database.
describe('Currencies HTTP API with MongoDB', () => {
  let app: INestApplication<App> | undefined;
  let moduleFixture: TestingModule | undefined;
  let connection: Connection | undefined;

  const databaseName = `currencies_test_${randomUUID().replaceAll('-', '')}`;

  const primaryId = '670d1234567890abcdef1234';
  const secondaryId = '670d1234567890abcdef1235';
  const missingId = '670d1234567890abcdef1236';

  const dollar = { id: primaryId, name: 'us dollar', currencyCode: 'USD' };
  const euro = { id: secondaryId, name: 'euro', currencyCode: 'EUR' };

  const pageOf = (data: unknown[], overrides: Record<string, unknown> = {}) => ({
    data,
    meta: {
      page: 1,
      limit: 10,
      total: data.length,
      totalPages: data.length ? 1 : 0,
      hasNextPage: false,
      hasPreviousPage: false,
      ...overrides,
    },
  });

  beforeAll(async () => {
    const uri = process.env.CURRENCIES_TEST_MONGO_URI;

    if (!uri) {
      throw new Error('Set CURRENCIES_TEST_MONGO_URI to a local/test MongoDB server.');
    }

    connection = await createConnection(uri, {
      dbName: databaseName,
      serverSelectionTimeoutMS: 5000,
    }).asPromise();

    const model = connection.model(Currency.name, CurrencySchema);
    await model.init();

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
  }, 30000);

  beforeEach(async () => {
    const model = connection!.model(Currency.name);

    await model.deleteMany({});

    await model.create([
      { _id: primaryId, name: 'US Dollar', currencyCode: 'USD' },
      { _id: secondaryId, name: 'Euro', currencyCode: 'EUR' },
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

  describe('create', () => {
    it('creates a currency and returns its mapped id', async () => {
      await request(app!.getHttpServer())
        .post('/api/currencies')
        .send({ name: 'Japanese Yen', currencyCode: 'JPY' })
        .expect(201)
        .expect(({ body }: { body: unknown }) => {
          expect(body).toEqual({
            id: expect.any(String) as string,
            name: 'japanese yen',
            currencyCode: 'JPY',
          });
        });
    });

    it('normalizes name to lowercase and code to uppercase', async () => {
      await request(app!.getHttpServer())
        .post('/api/currencies')
        .send({ name: '  British Pound  ', currencyCode: ' gbp ' })
        .expect(201)
        .expect(({ body }: { body: unknown }) => {
          expect(body).toEqual({
            id: expect.any(String) as string,
            name: 'british pound',
            currencyCode: 'GBP',
          });
        });
    });

    it.each([
      { name: 'US Dollar', currencyCode: 'XXX' },
      { name: 'Another currency', currencyCode: 'USD' },
    ])('rejects duplicate names or codes: %j', async (data) => {
      await request(app!.getHttpServer()).post('/api/currencies').send(data).expect(409);
    });

    it('enforces uniqueness for concurrent create requests', async () => {
      const results = await Promise.all(
        [1, 2].map(() =>
          request(app!.getHttpServer())
            .post('/api/currencies')
            .send({ name: 'Japanese Yen', currencyCode: 'JPY' }),
        ),
      );

      expect(results.map(({ status }) => status).sort()).toEqual([201, 409]);
    });

    it.each([
      { name: 'Japanese Yen', currencyCode: 'JP' },
      { name: 'Japanese Yen', currencyCode: 'JPYY' },
      { name: 'JY', currencyCode: 'JPY' },
      { name: 'Japanese Yen' },
      { currencyCode: 'JPY' },
    ])('rejects invalid create payloads: %j', async (data) => {
      await request(app!.getHttpServer()).post('/api/currencies').send(data).expect(400);
    });

    it('rejects unknown fields on create', async () => {
      await request(app!.getHttpServer())
        .post('/api/currencies')
        .send({ name: 'Japanese Yen', currencyCode: 'JPY', extra: 'nope' })
        .expect(400);
    });
  });

  describe('find all', () => {
    it('returns pagination metadata with default pagination in name order', async () => {
      await request(app!.getHttpServer())
        .get('/api/currencies')
        .expect(200)
        .expect(pageOf([euro, dollar]));
    });

    it('paginates in name order', async () => {
      await request(app!.getHttpServer())
        .get('/api/currencies')
        .query({ page: 2, limit: 1 })
        .expect(200)
        .expect({
          data: [dollar],
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

    it('searches names case-insensitively and treats regex characters literally', async () => {
      await request(app!.getHttpServer())
        .get('/api/currencies')
        .query({ name: 'DOLL' })
        .expect(200)
        .expect(pageOf([dollar]));

      await request(app!.getHttpServer())
        .get('/api/currencies')
        .query({ name: 'U.*' })
        .expect(200)
        .expect(pageOf([]));
    });

    it('filters by exact currency code', async () => {
      await request(app!.getHttpServer())
        .get('/api/currencies')
        .query({ currencyCode: 'usd' })
        .expect(200)
        .expect(pageOf([dollar]));

      await request(app!.getHttpServer())
        .get('/api/currencies')
        .query({ currencyCode: 'ZZZ' })
        .expect(200)
        .expect(pageOf([]));
    });

    it.each([{ limit: 101 }, { limit: 0 }, { page: -1 }, { page: 1.5 }, { currencyCode: 'US' }])(
      'rejects invalid query parameters: %j',
      async (query) => {
        await request(app!.getHttpServer()).get('/api/currencies').query(query).expect(400);
      },
    );
  });

  describe('find by id', () => {
    it('finds a currency by id and reports invalid/missing ids', async () => {
      await request(app!.getHttpServer())
        .get(`/api/currencies/${primaryId}`)
        .expect(200)
        .expect(dollar);

      await request(app!.getHttpServer()).get(`/api/currencies/${missingId}`).expect(404);

      await request(app!.getHttpServer()).get('/api/currencies/invalid').expect(400);
    });
  });

  describe('update', () => {
    it('updates only the supplied name', async () => {
      await request(app!.getHttpServer())
        .patch(`/api/currencies/${primaryId}`)
        .send({ name: 'United States Dollar' })
        .expect(200)
        .expect({ id: primaryId, name: 'united states dollar', currencyCode: 'USD' });
    });

    it('updates only the supplied currency code', async () => {
      await request(app!.getHttpServer())
        .patch(`/api/currencies/${primaryId}`)
        .send({ currencyCode: 'usa' })
        .expect(200)
        .expect({ id: primaryId, name: 'us dollar', currencyCode: 'USA' });
    });

    it('updates both fields at once', async () => {
      await request(app!.getHttpServer())
        .patch(`/api/currencies/${primaryId}`)
        .send({ name: 'Dollar', currencyCode: 'DOL' })
        .expect(200)
        .expect({ id: primaryId, name: 'dollar', currencyCode: 'DOL' });
    });

    it('rejects a duplicate update and permits retaining the same values', async () => {
      await request(app!.getHttpServer())
        .patch(`/api/currencies/${primaryId}`)
        .send({ currencyCode: 'EUR' })
        .expect(409);

      await request(app!.getHttpServer())
        .patch(`/api/currencies/${primaryId}`)
        .send({ name: 'Euro' })
        .expect(409);

      await request(app!.getHttpServer())
        .patch(`/api/currencies/${primaryId}`)
        .send({ name: 'US Dollar', currencyCode: 'USD' })
        .expect(200);
    });

    it('returns 404 when updating a missing currency', async () => {
      await request(app!.getHttpServer())
        .patch(`/api/currencies/${missingId}`)
        .send({ name: 'Ghost' })
        .expect(404);
    });

    it.each([{ name: null }, { currencyCode: null }, { currencyCode: 'TOO_LONG' }, {}])(
      'rejects invalid update payloads: %j',
      async (data) => {
        await request(app!.getHttpServer())
          .patch(`/api/currencies/${primaryId}`)
          .send(data)
          .expect(400);
      },
    );
  });

  describe('delete', () => {
    it('soft deletes, hides the currency, and rejects subsequent updates/deletes', async () => {
      await request(app!.getHttpServer())
        .delete(`/api/currencies/${primaryId}`)
        .expect(204)
        .expect('');

      const deleted = await connection!.model<Currency>(Currency.name).findById(primaryId);

      expect(deleted?.isDeleted).toBe(true);
      expect(deleted?.deletedAt).toBeInstanceOf(Date);

      await request(app!.getHttpServer()).get(`/api/currencies/${primaryId}`).expect(404);

      await request(app!.getHttpServer())
        .get('/api/currencies')
        .query({ currencyCode: 'USD' })
        .expect(200)
        .expect(pageOf([]));

      await request(app!.getHttpServer())
        .patch(`/api/currencies/${primaryId}`)
        .send({ name: 'New Dollar' })
        .expect(404);

      await request(app!.getHttpServer()).delete(`/api/currencies/${primaryId}`).expect(404);
    });

    it('returns CURRENCY_NOT_FOUND for a missing currency', async () => {
      await request(app!.getHttpServer())
        .delete(`/api/currencies/${missingId}`)
        .expect(404)
        .expect(({ body }: { body: unknown }) => {
          expect(body).toMatchObject({ code: 'CURRENCY_NOT_FOUND' });
        });
    });

    it('allows reusing name and code after soft deletion', async () => {
      await request(app!.getHttpServer()).delete(`/api/currencies/${primaryId}`).expect(204);

      await request(app!.getHttpServer())
        .post('/api/currencies')
        .send({ name: 'US Dollar', currencyCode: 'USD' })
        .expect(201);
    });
  });
});
