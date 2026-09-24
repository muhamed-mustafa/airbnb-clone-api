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
  UnitCategory,
  UnitCategorySchema,
} from '../src/infrastructure/unit-categories/schemas/unit-categories.schema';

// Opt-in integration suite: always uses a newly generated database, never the URI's database.
describe('Unit Categories HTTP API with MongoDB', () => {
  let app: INestApplication<App> | undefined;
  let moduleFixture: TestingModule | undefined;
  let connection: Connection | undefined;

  const databaseName = `unit_categories_test_${randomUUID().replaceAll('-', '')}`;

  const primaryId = '670d1234567890abcdef1234';
  const secondaryId = '670d1234567890abcdef1235';
  const missingId = '670d1234567890abcdef1236';

  const weight = { id: primaryId, name: 'weight', icon: 'weight-icon' };
  const length = { id: secondaryId, name: 'length', icon: 'length-icon' };

  const pageOf = (data: unknown[]) => ({
    data,
    meta: {
      page: 1,
      limit: 10,
      total: data.length,
      totalPages: data.length ? 1 : 0,
      hasNextPage: false,
      hasPreviousPage: false,
    },
  });

  beforeAll(async () => {
    const uri = process.env.UNIT_CATEGORIES_TEST_MONGO_URI;

    if (!uri) {
      throw new Error('Set UNIT_CATEGORIES_TEST_MONGO_URI to a local/test MongoDB server.');
    }

    connection = await createConnection(uri, {
      dbName: databaseName,
      serverSelectionTimeoutMS: 5000,
    }).asPromise();

    const model = connection.model(UnitCategory.name, UnitCategorySchema);
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
    const model = connection!.model(UnitCategory.name);

    await model.deleteMany({});

    await model.create([
      { _id: primaryId, name: 'Weight', icon: 'weight-icon' },
      { _id: secondaryId, name: 'Length', icon: 'length-icon' },
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
    it('creates a unit category and returns its mapped id', async () => {
      await request(app!.getHttpServer())
        .post('/api/unit-categories')
        .send({ name: 'Volume', icon: 'volume-icon' })
        .expect(201)
        .expect(({ body }: { body: unknown }) => {
          expect(body).toEqual({
            id: expect.any(String) as string,
            name: 'volume',
            icon: 'volume-icon',
          });
        });
    });

    it('normalizes name to lowercase, trims, and defaults icon to empty string', async () => {
      await request(app!.getHttpServer())
        .post('/api/unit-categories')
        .send({ name: '  Temperature  ' })
        .expect(201)
        .expect(({ body }: { body: unknown }) => {
          expect(body).toEqual({
            id: expect.any(String) as string,
            name: 'temperature',
            icon: '',
          });
        });
    });

    it('rejects a duplicate active name', async () => {
      await request(app!.getHttpServer())
        .post('/api/unit-categories')
        .send({ name: 'Weight' })
        .expect(409);
    });

    it('enforces uniqueness for concurrent create requests', async () => {
      const results = await Promise.all(
        [1, 2].map(() =>
          request(app!.getHttpServer()).post('/api/unit-categories').send({ name: 'Volume' }),
        ),
      );

      expect(results.map(({ status }) => status).sort()).toEqual([201, 409]);
    });

    it.each([
      { name: 'ab' },
      { name: '' },
      { name: 123 },
      { icon: 'orphan-icon' },
      { name: 'Volume', icon: 456 },
      { name: 'Volume', icon: 'x'.repeat(101) },
    ])('rejects invalid create payloads: %j', async (data) => {
      await request(app!.getHttpServer()).post('/api/unit-categories').send(data).expect(400);
    });

    it('rejects unknown fields on create', async () => {
      await request(app!.getHttpServer())
        .post('/api/unit-categories')
        .send({ name: 'Volume', extra: 'nope' })
        .expect(400);
    });
  });

  describe('find all', () => {
    it('returns pagination metadata with default pagination in name order', async () => {
      await request(app!.getHttpServer())
        .get('/api/unit-categories')
        .expect(200)
        .expect(pageOf([length, weight]));
    });

    it('paginates in name order', async () => {
      await request(app!.getHttpServer())
        .get('/api/unit-categories')
        .query({ page: 2, limit: 1 })
        .expect(200)
        .expect({
          data: [weight],
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
        .get('/api/unit-categories')
        .query({ name: 'WEI' })
        .expect(200)
        .expect(pageOf([weight]));

      await request(app!.getHttpServer())
        .get('/api/unit-categories')
        .query({ name: 'w.*' })
        .expect(200)
        .expect(pageOf([]));
    });

    it.each([{ limit: 101 }, { limit: 0 }, { page: -1 }, { page: 1.5 }, { name: 'ab' }])(
      'rejects invalid query parameters: %j',
      async (query) => {
        await request(app!.getHttpServer()).get('/api/unit-categories').query(query).expect(400);
      },
    );
  });

  describe('find by id', () => {
    it('finds a unit category by id and reports invalid/missing ids', async () => {
      await request(app!.getHttpServer())
        .get(`/api/unit-categories/${primaryId}`)
        .expect(200)
        .expect(weight);

      await request(app!.getHttpServer()).get(`/api/unit-categories/${missingId}`).expect(404);

      await request(app!.getHttpServer()).get('/api/unit-categories/invalid').expect(400);
    });
  });

  describe('update', () => {
    it('updates only the supplied name', async () => {
      await request(app!.getHttpServer())
        .patch(`/api/unit-categories/${primaryId}`)
        .send({ name: 'Mass' })
        .expect(200)
        .expect({ id: primaryId, name: 'mass', icon: 'weight-icon' });
    });

    it('updates only the supplied icon', async () => {
      await request(app!.getHttpServer())
        .patch(`/api/unit-categories/${primaryId}`)
        .send({ icon: 'scale-icon' })
        .expect(200)
        .expect({ id: primaryId, name: 'weight', icon: 'scale-icon' });
    });

    it('updates both fields at once', async () => {
      await request(app!.getHttpServer())
        .patch(`/api/unit-categories/${primaryId}`)
        .send({ name: 'Mass', icon: 'scale-icon' })
        .expect(200)
        .expect({ id: primaryId, name: 'mass', icon: 'scale-icon' });
    });

    it('rejects a duplicate update and permits retaining the same values', async () => {
      await request(app!.getHttpServer())
        .patch(`/api/unit-categories/${primaryId}`)
        .send({ name: 'Length' })
        .expect(409);

      await request(app!.getHttpServer())
        .patch(`/api/unit-categories/${primaryId}`)
        .send({ name: 'Weight' })
        .expect(200);
    });

    it('returns 404 when updating a missing unit category', async () => {
      await request(app!.getHttpServer())
        .patch(`/api/unit-categories/${missingId}`)
        .send({ name: 'Ghost' })
        .expect(404);
    });

    it.each([{ name: null }, { name: 'ab' }, { icon: 123 }, { icon: 'x'.repeat(101) }, {}])(
      'rejects invalid update payloads: %j',
      async (data) => {
        await request(app!.getHttpServer())
          .patch(`/api/unit-categories/${primaryId}`)
          .send(data)
          .expect(400);
      },
    );
  });

  describe('delete', () => {
    it('soft deletes, hides the unit category, and rejects subsequent updates/deletes', async () => {
      await request(app!.getHttpServer())
        .delete(`/api/unit-categories/${primaryId}`)
        .expect(204)
        .expect('');

      const deleted = await connection!.model<UnitCategory>(UnitCategory.name).findById(primaryId);

      expect(deleted?.isDeleted).toBe(true);
      expect(deleted?.deletedAt).toBeInstanceOf(Date);

      await request(app!.getHttpServer()).get(`/api/unit-categories/${primaryId}`).expect(404);

      await request(app!.getHttpServer())
        .get('/api/unit-categories')
        .query({ name: 'weight' })
        .expect(200)
        .expect(pageOf([]));

      await request(app!.getHttpServer())
        .patch(`/api/unit-categories/${primaryId}`)
        .send({ name: 'Mass' })
        .expect(404);

      await request(app!.getHttpServer()).delete(`/api/unit-categories/${primaryId}`).expect(404);
    });

    it('returns UNIT_CATEGORY_NOT_FOUND for a missing unit category', async () => {
      await request(app!.getHttpServer())
        .delete(`/api/unit-categories/${missingId}`)
        .expect(404)
        .expect(({ body }: { body: unknown }) => {
          expect(body).toMatchObject({ code: 'UNIT_CATEGORY_NOT_FOUND' });
        });
    });

    it('allows reusing the name after soft deletion', async () => {
      await request(app!.getHttpServer()).delete(`/api/unit-categories/${primaryId}`).expect(204);

      await request(app!.getHttpServer())
        .post('/api/unit-categories')
        .send({ name: 'Weight', icon: 'weight-icon' })
        .expect(201);
    });
  });
});
