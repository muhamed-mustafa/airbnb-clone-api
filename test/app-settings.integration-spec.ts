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
  AppSettings,
  AppSettingsSchema,
} from '../src/infrastructure/app-settings/schemas/app-settings.schema';

// Opt-in integration suite: always uses a newly generated database, never the URI's database.
describe('App Settings HTTP API with MongoDB', () => {
  let app: INestApplication<App> | undefined;
  let moduleFixture: TestingModule | undefined;
  let connection: Connection | undefined;

  const databaseName = `app_settings_test_${randomUUID().replaceAll('-', '')}`;

  const countDocuments = () => connection!.model(AppSettings.name).countDocuments({});

  beforeAll(async () => {
    const uri = process.env.APP_SETTINGS_TEST_MONGO_URI;

    if (!uri) {
      throw new Error('Set APP_SETTINGS_TEST_MONGO_URI to a local/test MongoDB server.');
    }

    connection = await createConnection(uri, {
      dbName: databaseName,
      serverSelectionTimeoutMS: 5000,
    }).asPromise();

    connection.model(AppSettings.name, AppSettingsSchema);

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
    await connection!.model(AppSettings.name).deleteMany({});
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

  describe('find', () => {
    it('returns 404 when the settings have not been initialized', async () => {
      await request(app!.getHttpServer())
        .get('/api/app-settings')
        .expect(404)
        .expect(({ body }: { body: unknown }) => {
          expect(body).toMatchObject({ code: 'APP_SETTINGS_NOT_FOUND' });
        });
    });

    it('returns the singleton settings when they exist', async () => {
      await connection!.model(AppSettings.name).create({ vatRate: 14, minPrice: 500 });

      await request(app!.getHttpServer())
        .get('/api/app-settings')
        .expect(200)
        .expect({ vatRate: 14, minPrice: 500 });
    });
  });

  describe('upsert', () => {
    it('creates the document on the first upsert', async () => {
      await request(app!.getHttpServer())
        .put('/api/app-settings')
        .send({ vatRate: 14, minPrice: 500 })
        .expect(200)
        .expect({ vatRate: 14, minPrice: 500 });

      expect(await countDocuments()).toBe(1);
    });

    it('creates the document with schema defaults for an empty body', async () => {
      await request(app!.getHttpServer())
        .put('/api/app-settings')
        .send({})
        .expect(200)
        .expect({ vatRate: 0, minPrice: 0 });

      expect(await countDocuments()).toBe(1);
    });

    it('updates the existing document on a second upsert', async () => {
      await request(app!.getHttpServer())
        .put('/api/app-settings')
        .send({ vatRate: 14, minPrice: 500 })
        .expect(200);

      await request(app!.getHttpServer())
        .put('/api/app-settings')
        .send({ vatRate: 20, minPrice: 900 })
        .expect(200)
        .expect({ vatRate: 20, minPrice: 900 });

      expect(await countDocuments()).toBe(1);
    });

    it('updates only vatRate and preserves minPrice', async () => {
      await request(app!.getHttpServer())
        .put('/api/app-settings')
        .send({ vatRate: 14, minPrice: 500 })
        .expect(200);

      await request(app!.getHttpServer())
        .put('/api/app-settings')
        .send({ vatRate: 21 })
        .expect(200)
        .expect({ vatRate: 21, minPrice: 500 });
    });

    it('updates only minPrice and preserves vatRate', async () => {
      await request(app!.getHttpServer())
        .put('/api/app-settings')
        .send({ vatRate: 14, minPrice: 500 })
        .expect(200);

      await request(app!.getHttpServer())
        .put('/api/app-settings')
        .send({ minPrice: 750 })
        .expect(200)
        .expect({ vatRate: 14, minPrice: 750 });
    });

    it('accepts decimal values within range', async () => {
      await request(app!.getHttpServer())
        .put('/api/app-settings')
        .send({ vatRate: 14.5, minPrice: 99.99 })
        .expect(200)
        .expect({ vatRate: 14.5, minPrice: 99.99 });
    });

    it('never creates more than one settings document across repeated upserts', async () => {
      await request(app!.getHttpServer())
        .put('/api/app-settings')
        .send({ vatRate: 5, minPrice: 100 })
        .expect(200);
      await request(app!.getHttpServer())
        .put('/api/app-settings')
        .send({ vatRate: 10, minPrice: 200 })
        .expect(200);
      await request(app!.getHttpServer())
        .put('/api/app-settings')
        .send({ vatRate: 15, minPrice: 300 })
        .expect(200)
        .expect({ vatRate: 15, minPrice: 300 });

      expect(await countDocuments()).toBe(1);
    });

    it('keeps a single document under concurrent upserts', async () => {
      const results = await Promise.all(
        [8, 12, 20].map((vatRate) =>
          request(app!.getHttpServer()).put('/api/app-settings').send({ vatRate }),
        ),
      );

      expect(results.map(({ status }) => status)).toEqual([200, 200, 200]);
      expect(await countDocuments()).toBe(1);
    });
  });

  describe('validation', () => {
    it.each([
      { vatRate: -1 },
      { vatRate: 26 },
      { minPrice: -1 },
      { vatRate: 'high' },
      { minPrice: 'cheap' },
      { vatRate: null },
      { minPrice: null },
      { vatRate: 10, unexpected: true },
    ])('rejects invalid upsert payloads: %j', async (data) => {
      await request(app!.getHttpServer()).put('/api/app-settings').send(data).expect(400);

      expect(await countDocuments()).toBe(0);
    });
  });
});
