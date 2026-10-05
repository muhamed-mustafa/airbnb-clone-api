import { INestApplication } from '@nestjs/common';
import { getConnectionToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { Mongoose } from 'mongoose';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app/app.module';
import { InitializeAdminUseCase } from '../src/application/admin/use-cases/initialize-admin.usecase';

describe('App (e2e)', () => {
  let app: INestApplication<App>;
  let moduleFixture: TestingModule | undefined;
  // This HTTP routing test needs model registration, not a live MongoDB server.
  // Disable buffering so accidental database operations fail immediately.
  const connection = new Mongoose({
    autoCreate: false,
    autoIndex: false,
    bufferCommands: false,
  }).createConnection();

  beforeAll(async () => {
    moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(getConnectionToken())
      .useValue(connection)
      // This routing smoke test must not seed through its disconnected database stub.
      .overrideProvider(InitializeAdminUseCase)
      .useValue({ execute: jest.fn().mockResolvedValue(undefined) })
      .compile();

    app = moduleFixture.createNestApplication();

    await app.init();
  });

  afterAll(async () => {
    try {
      await (app ?? moduleFixture)?.close();
    } finally {
      await connection.destroy();
    }
  });

  describe('Application bootstrap', () => {
    it('should return 404 for an unknown route', async () => {
      await request(app.getHttpServer()).get('/').expect(404);
    });
  });
});
