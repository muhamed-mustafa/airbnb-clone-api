import { INestApplication } from '@nestjs/common';
import { getConnectionToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { Connection, ConnectionStates, createConnection } from 'mongoose';
import { I18nMiddleware, I18nValidationPipe } from 'nestjs-i18n';
import { randomUUID } from 'node:crypto';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app/app.module';
import { City, CitySchema } from '../src/infrastructure/cities/schemas/cities.schema';
import { Country, CountrySchema } from '../src/infrastructure/countries/schemas/countries.schema';

// Opt-in integration suite: always uses a newly generated database, never the URI's database.
describe('Cities HTTP API with MongoDB', () => {
  let app: INestApplication<App> | undefined;
  let moduleFixture: TestingModule | undefined;
  let connection: Connection | undefined;

  const databaseName = `cities_test_${randomUUID().replaceAll('-', '')}`;

  const egyptId = '670d1234567890abcdef1234';
  const usaId = '670d1234567890abcdef1235';
  const deletedCountryId = '670d1234567890abcdef1236';

  const alexandriaId = '670d1234567890abcdef5671';
  const bostonId = '670d1234567890abcdef5672';
  const cairoId = '670d1234567890abcdef5673';
  const missingId = '670d1234567890abcdef5679';

  const alexandria = { id: alexandriaId, name: 'alexandria', country: egyptId };
  const boston = { id: bostonId, name: 'boston', country: usaId };
  const cairo = { id: cairoId, name: 'cairo', country: egyptId };

  const emptyPage = {
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

  beforeAll(async () => {
    const uri = process.env.CITIES_TEST_MONGO_URI;

    if (!uri) {
      throw new Error('Set CITIES_TEST_MONGO_URI to a local/test MongoDB server.');
    }

    connection = await createConnection(uri, {
      dbName: databaseName,
      serverSelectionTimeoutMS: 5000,
    }).asPromise();

    await connection.model(Country.name, CountrySchema).init();
    await connection.model(City.name, CitySchema).init();

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
    const countryModel = connection!.model(Country.name);
    const cityModel = connection!.model(City.name);

    await Promise.all([countryModel.deleteMany({}), cityModel.deleteMany({})]);

    await countryModel.create([
      { _id: egyptId, name: 'Egypt', code: 'EG' },
      { _id: usaId, name: 'United States', code: 'US' },
      {
        _id: deletedCountryId,
        name: 'Atlantis',
        code: 'AT',
        isDeleted: true,
        deletedAt: new Date(),
      },
    ]);

    await cityModel.create([
      { _id: cairoId, name: 'Cairo', country: egyptId },
      { _id: alexandriaId, name: 'Alexandria', country: egyptId },
      { _id: bostonId, name: 'Boston', country: usaId },
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

  describe('POST /cities', () => {
    it('creates a city with a normalized name and returns its mapped id', async () => {
      await request(app!.getHttpServer())
        .post('/api/cities')
        .send({ name: '  Giza ', country: egyptId })
        .expect(201)
        .expect(({ body }: { body: unknown }) => {
          expect(body).toEqual({
            id: expect.any(String) as string,
            name: 'giza',
            country: egyptId,
          });
        });
    });

    it('rejects a duplicate name in the same country, regardless of case', async () => {
      await request(app!.getHttpServer())
        .post('/api/cities')
        .send({ name: 'CAIRO', country: egyptId })
        .expect(409)
        .expect(({ body }: { body: unknown }) => {
          expect(body).toMatchObject({ code: 'CITY_ALREADY_EXISTS' });
        });
    });

    it('allows the same name in a different country', async () => {
      await request(app!.getHttpServer())
        .post('/api/cities')
        .send({ name: 'Cairo', country: usaId })
        .expect(201)
        .expect(({ body }: { body: unknown }) => {
          expect(body).toMatchObject({ name: 'cairo', country: usaId });
        });
    });

    it('enforces uniqueness for concurrent create requests', async () => {
      const results = await Promise.all(
        [1, 2].map(() =>
          request(app!.getHttpServer())
            .post('/api/cities')
            .send({ name: 'Giza', country: egyptId }),
        ),
      );

      expect(results.map(({ status }) => status).sort()).toEqual([201, 409]);
    });

    it.each([
      { label: 'missing', country: missingId },
      { label: 'soft-deleted', country: deletedCountryId },
    ])('rejects a $label country with COUNTRY_NOT_FOUND', async ({ country }) => {
      await request(app!.getHttpServer())
        .post('/api/cities')
        .send({ name: 'Giza', country })
        .expect(404)
        .expect(({ body }: { body: unknown }) => {
          expect(body).toMatchObject({ code: 'COUNTRY_NOT_FOUND' });
        });
    });

    it.each([
      { country: 'invalid' },
      { name: 'Giza' },
      { name: 'Giza', country: 'invalid' },
      { country: egyptId },
      { name: 'Gz', country: egyptId },
      { name: 'G'.repeat(51), country: egyptId },
      { name: '   ', country: egyptId },
      { name: 123, country: egyptId },
      { name: 'Giza', country: egyptId, extra: 'field' },
    ])('rejects invalid creation data: %j', async (data) => {
      await request(app!.getHttpServer()).post('/api/cities').send(data).expect(400);
    });

    it('allows reusing a name after soft deletion', async () => {
      await request(app!.getHttpServer()).delete(`/api/cities/${cairoId}`).expect(204);

      await request(app!.getHttpServer())
        .post('/api/cities')
        .send({ name: 'Cairo', country: egyptId })
        .expect(201);
    });
  });

  describe('GET /cities', () => {
    it('returns active cities sorted by name with pagination metadata', async () => {
      await request(app!.getHttpServer())
        .get('/api/cities')
        .expect(200)
        .expect({
          data: [alexandria, boston, cairo],
          meta: {
            page: 1,
            limit: 10,
            total: 3,
            totalPages: 1,
            hasNextPage: false,
            hasPreviousPage: false,
          },
        });
    });

    it('searches names partially and case-insensitively', async () => {
      await request(app!.getHttpServer())
        .get('/api/cities')
        .query({ name: 'AIR' })
        .expect(200)
        .expect({
          ...emptyPage,
          data: [cairo],
          meta: { ...emptyPage.meta, total: 1, totalPages: 1 },
        });
    });

    it('treats regex characters in the name literally', async () => {
      await request(app!.getHttpServer())
        .get('/api/cities')
        .query({ name: 'c.*' })
        .expect(200)
        .expect(emptyPage);
    });

    it('filters by exact country', async () => {
      await request(app!.getHttpServer())
        .get('/api/cities')
        .query({ country: usaId })
        .expect(200)
        .expect({
          ...emptyPage,
          data: [boston],
          meta: { ...emptyPage.meta, total: 1, totalPages: 1 },
        });
    });

    it('combines name and country filters', async () => {
      await request(app!.getHttpServer())
        .get('/api/cities')
        .query({ name: 'cai', country: usaId })
        .expect(200)
        .expect(emptyPage);
    });

    it('applies page and limit', async () => {
      await request(app!.getHttpServer())
        .get('/api/cities')
        .query({ page: 2, limit: 2 })
        .expect(200)
        .expect({
          data: [cairo],
          meta: {
            page: 2,
            limit: 2,
            total: 3,
            totalPages: 2,
            hasNextPage: false,
            hasPreviousPage: true,
          },
        });

      await request(app!.getHttpServer())
        .get('/api/cities')
        .query({ page: 1, limit: 2 })
        .expect(200)
        .expect({
          data: [alexandria, boston],
          meta: {
            page: 1,
            limit: 2,
            total: 3,
            totalPages: 2,
            hasNextPage: true,
            hasPreviousPage: false,
          },
        });
    });

    it.each([
      { limit: 101 },
      { limit: 0 },
      { page: -1 },
      { page: 1.5 },
      { country: 'invalid' },
      { name: 'ca' },
    ])('rejects invalid query: %j', async (query) => {
      await request(app!.getHttpServer()).get('/api/cities').query(query).expect(400);
    });
  });

  describe('GET /cities/:id', () => {
    it('finds an active city by id', async () => {
      await request(app!.getHttpServer()).get(`/api/cities/${cairoId}`).expect(200).expect(cairo);
    });

    it('reports missing and invalid ids', async () => {
      await request(app!.getHttpServer())
        .get(`/api/cities/${missingId}`)
        .expect(404)
        .expect(({ body }: { body: unknown }) => {
          expect(body).toMatchObject({ code: 'CITY_NOT_FOUND' });
        });

      await request(app!.getHttpServer()).get('/api/cities/invalid').expect(400);
    });
  });

  describe('PATCH /cities/:id', () => {
    it('updates only the name', async () => {
      await request(app!.getHttpServer())
        .patch(`/api/cities/${cairoId}`)
        .send({ name: 'New Cairo' })
        .expect(200)
        .expect({ ...cairo, name: 'new cairo' });
    });

    it('moves a city to another existing country', async () => {
      await request(app!.getHttpServer())
        .patch(`/api/cities/${cairoId}`)
        .send({ country: usaId })
        .expect(200)
        .expect({ ...cairo, country: usaId });
    });

    it('rejects moving a city to a missing or soft-deleted country and leaves it unchanged', async () => {
      for (const country of [missingId, deletedCountryId]) {
        await request(app!.getHttpServer())
          .patch(`/api/cities/${cairoId}`)
          .send({ country })
          .expect(404)
          .expect(({ body }: { body: unknown }) => {
            expect(body).toMatchObject({ code: 'COUNTRY_NOT_FOUND' });
          });
      }

      await request(app!.getHttpServer()).get(`/api/cities/${cairoId}`).expect(200).expect(cairo);
    });

    it.each([
      { label: 'renaming within a country', id: alexandriaId, data: { name: 'CAIRO' } },
      { label: 'moving into a country', id: bostonId, data: { name: 'Cairo', country: egyptId } },
    ])('rejects a duplicate { country, name } when $label', async ({ id, data }) => {
      await request(app!.getHttpServer())
        .patch(`/api/cities/${id}`)
        .send(data)
        .expect(409)
        .expect(({ body }: { body: unknown }) => {
          expect(body).toEqual({
            errors: [
              {
                code: 'cities.CITY_ALREADY_EXISTS',
                field: 'name',
                message: expect.any(String) as string,
              },
            ],
          });
        });
    });

    it('permits retaining the same values', async () => {
      await request(app!.getHttpServer())
        .patch(`/api/cities/${cairoId}`)
        .send({ name: 'Cairo', country: egyptId })
        .expect(200)
        .expect(cairo);
    });

    it('rejects an empty update payload', async () => {
      await request(app!.getHttpServer()).patch(`/api/cities/${cairoId}`).send({}).expect(400);
    });

    it.each([
      { name: null },
      { country: null },
      { country: 'invalid' },
      { name: 'Ca' },
      { name: 'Cairo', extra: 'field' },
    ])('rejects invalid update data: %j', async (data) => {
      await request(app!.getHttpServer()).patch(`/api/cities/${cairoId}`).send(data).expect(400);
    });

    it('reports a missing city', async () => {
      await request(app!.getHttpServer())
        .patch(`/api/cities/${missingId}`)
        .send({ name: 'Nowhere' })
        .expect(404)
        .expect(({ body }: { body: unknown }) => {
          expect(body).toMatchObject({ code: 'CITY_NOT_FOUND' });
        });
    });
  });

  describe('DELETE /cities/:id', () => {
    it('soft deletes, hides the city, and rejects subsequent reads/updates/deletes', async () => {
      await request(app!.getHttpServer()).delete(`/api/cities/${cairoId}`).expect(204).expect('');

      const deleted = await connection!.model<City>(City.name).findById(cairoId);

      expect(deleted?.isDeleted).toBe(true);
      expect(deleted?.deletedAt).toBeInstanceOf(Date);

      await request(app!.getHttpServer()).get(`/api/cities/${cairoId}`).expect(404);

      await request(app!.getHttpServer())
        .get('/api/cities')
        .expect(200)
        .expect({
          data: [alexandria, boston],
          meta: { ...emptyPage.meta, total: 2, totalPages: 1 },
        });

      await request(app!.getHttpServer())
        .get('/api/cities')
        .query({ name: 'cairo' })
        .expect(200)
        .expect(emptyPage);

      await request(app!.getHttpServer())
        .patch(`/api/cities/${cairoId}`)
        .send({ name: 'New Cairo' })
        .expect(404);

      await request(app!.getHttpServer()).delete(`/api/cities/${cairoId}`).expect(404);
    });

    it('reports missing and invalid ids', async () => {
      await request(app!.getHttpServer()).delete(`/api/cities/${missingId}`).expect(404);
      await request(app!.getHttpServer()).delete('/api/cities/invalid').expect(400);
    });
  });
});
