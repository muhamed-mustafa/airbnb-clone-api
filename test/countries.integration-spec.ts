import { INestApplication } from '@nestjs/common';
import { getConnectionToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { Connection, ConnectionStates, createConnection } from 'mongoose';
import { I18nMiddleware, I18nValidationPipe } from 'nestjs-i18n';
import { randomUUID } from 'node:crypto';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app/app.module';
import { Country, CountrySchema } from '../src/infrastructure/countries/schemas/countries.schema';

// Opt-in integration suite: always uses a newly generated database, never the URI's database.
describe('Countries HTTP API with MongoDB', () => {
  let app: INestApplication<App> | undefined;
  let moduleFixture: TestingModule | undefined;
  let connection: Connection | undefined;

  const databaseName = `countries_test_${randomUUID().replaceAll('-', '')}`;

  const primaryId = '670d1234567890abcdef1234';
  const secondaryId = '670d1234567890abcdef1235';
  const missingId = '670d1234567890abcdef1236';

  beforeAll(async () => {
    const uri = process.env.COUNTRIES_TEST_MONGO_URI;

    if (!uri) {
      throw new Error('Set COUNTRIES_TEST_MONGO_URI to a local/test MongoDB server.');
    }

    connection = await createConnection(uri, {
      dbName: databaseName,
      serverSelectionTimeoutMS: 5000,
    }).asPromise();

    const model = connection.model(Country.name, CountrySchema);
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
    const model = connection!.model(Country.name);

    await model.deleteMany({});

    await model.create([
      {
        _id: primaryId,
        name: 'Egypt',
        code: 'EG',
      },
      {
        _id: secondaryId,
        name: 'France',
        code: 'FR',
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

  it('creates a country and returns its mapped id', async () => {
    await request(app!.getHttpServer())
      .post('/api/countries')
      .send({
        name: 'Germany',
        code: 'DE',
      })
      .expect(201)
      .expect(({ body }: { body: unknown }) => {
        expect(body).toEqual({
          id: expect.any(String) as string,
          name: 'germany',
          code: 'DE',
        });
      });
  });

  it.each([
    { name: 'Egypt', code: 'XX' },
    { name: 'Another country', code: 'EG' },
  ])('rejects duplicate names or codes: %j', async (data) => {
    await request(app!.getHttpServer()).post('/api/countries').send(data).expect(409);
  });

  it('enforces uniqueness for concurrent create requests', async () => {
    const results = await Promise.all(
      [1, 2].map(() =>
        request(app!.getHttpServer()).post('/api/countries').send({
          name: 'Germany',
          code: 'DE',
        }),
      ),
    );

    expect(results.map(({ status }) => status).sort()).toEqual([201, 409]);
  });

  it('searches names case-insensitively and treats regex characters literally', async () => {
    await request(app!.getHttpServer())
      .get('/api/countries')
      .query({ name: 'EGY' })
      .expect(200)
      .expect([{ id: primaryId, name: 'egypt', code: 'EG' }]);

    await request(app!.getHttpServer())
      .get('/api/countries')
      .query({ name: '.*' })
      .expect(200)
      .expect([]);
  });

  it('paginates in name order', async () => {
    await request(app!.getHttpServer())
      .get('/api/countries')
      .query({
        page: 2,
        limit: 1,
      })
      .expect(200)
      .expect([{ id: secondaryId, name: 'france', code: 'FR' }]);
  });

  it.each([{ limit: 101 }, { limit: 0 }, { page: -1 }, { page: 1.5 }])(
    'rejects invalid pagination: %j',
    async (query) => {
      await request(app!.getHttpServer()).get('/api/countries').query(query).expect(400);
    },
  );

  it('finds a country by id and reports invalid/missing ids', async () => {
    await request(app!.getHttpServer()).get(`/api/countries/${primaryId}`).expect(200).expect({
      id: primaryId,
      name: 'egypt',
      code: 'EG',
    });

    await request(app!.getHttpServer()).get(`/api/countries/${missingId}`).expect(404);

    await request(app!.getHttpServer()).get('/api/countries/invalid').expect(400);
  });

  it('updates only the supplied field', async () => {
    await request(app!.getHttpServer())
      .patch(`/api/countries/${primaryId}`)
      .send({
        name: 'New Egypt',
      })
      .expect(200)
      .expect({
        id: primaryId,
        name: 'new egypt',
        code: 'EG',
      });
  });

  it('rejects a duplicate update and permits retaining the same values', async () => {
    await request(app!.getHttpServer())
      .patch(`/api/countries/${primaryId}`)
      .send({
        code: 'FR',
      })
      .expect(409);

    await request(app!.getHttpServer())
      .patch(`/api/countries/${primaryId}`)
      .send({
        name: 'Egypt',
        code: 'EG',
      })
      .expect(200);
  });

  it.each([{ name: null }, { code: null }, { code: 'LONG' }])(
    'rejects invalid update data: %j',
    async (data) => {
      await request(app!.getHttpServer())
        .patch(`/api/countries/${primaryId}`)
        .send(data)
        .expect(400);
    },
  );

  it('rejects invalid country codes on creation', async () => {
    await request(app!.getHttpServer())
      .post('/api/countries')
      .send({
        name: 'Germany',
        code: 'LONG',
      })
      .expect(400);
  });

  it('soft deletes, hides the country, and rejects subsequent updates/deletes', async () => {
    await request(app!.getHttpServer())
      .delete(`/api/countries/${primaryId}`)
      .expect(204)
      .expect('');

    const deleted = await connection!.model<Country>(Country.name).findById(primaryId);

    expect(deleted?.isDeleted).toBe(true);
    expect(deleted?.deletedAt).toBeInstanceOf(Date);

    await request(app!.getHttpServer()).get(`/api/countries/${primaryId}`).expect(404);

    await request(app!.getHttpServer())
      .get('/api/countries')
      .query({
        code: 'EG',
      })
      .expect(200)
      .expect([]);

    await request(app!.getHttpServer())
      .patch(`/api/countries/${primaryId}`)
      .send({
        name: 'New Egypt',
      })
      .expect(404);

    await request(app!.getHttpServer()).delete(`/api/countries/${primaryId}`).expect(404);
  });

  it('allows reusing name and code after soft deletion', async () => {
    await request(app!.getHttpServer()).delete(`/api/countries/${primaryId}`).expect(204);

    await request(app!.getHttpServer())
      .post('/api/countries')
      .send({
        name: 'Egypt',
        code: 'EG',
      })
      .expect(201);
  });

  it('rejects an empty update payload', async () => {
    await request(app!.getHttpServer()).patch(`/api/countries/${primaryId}`).send({}).expect(400);
  });
});
