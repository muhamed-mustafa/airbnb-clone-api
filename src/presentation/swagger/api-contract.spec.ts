import { Test } from '@nestjs/testing';
import { type INestApplication, UnauthorizedException } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import request from 'supertest';
import type { App } from 'supertest/types';
import { AuthController } from '../auth/auth.controller';
import { AdminController } from '../admin/admin.controller';
import { AdminAuthController } from '../admin/admin-auth.controller';
import { AppSettingsController } from '../app-settings/app-settings.controller';
import { AuthService } from '../../application/auth/services/auth.service';
import { AdminService } from '../../application/admin/services/admin.service';
import { AppSettingsService } from '../../application/app-settings/services/app-settings.service';
import { TOKEN_SERVICE_TOKEN } from '../../application/auth/services/token-service.token';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { TransformResponseInterceptor } from '../../common/interceptors/transform-response.interceptor';

describe('HTTP route contract with actual authorization guards', () => {
  let app: INestApplication<App>;
  const tokens = { accessToken: 'access', refreshToken: 'refresh' };
  const credentials = { email: 'api@example.com', password: 'Password123!' };
  beforeAll(async () => {
    const module = await Test.createTestingModule({
      controllers: [AuthController, AdminController, AdminAuthController, AppSettingsController],
      providers: [
        JwtAuthGuard,
        RolesGuard,
        {
          provide: AuthService,
          useValue: {
            login: jest.fn().mockResolvedValue(tokens),
            register: jest.fn().mockResolvedValue(tokens),
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
      await request(app.getHttpServer())
        .post(path)
        .send({ ...credentials, token: 'refresh' })
        .expect(200)
        .expect({ data: tokens });
    },
  );
  it('returns 201 for registration', async () => {
    await request(app.getHttpServer())
      .post('/api/auth/register')
      .send({ ...credentials, name: 'User' })
      .expect(201);
  });
  it.each(['/api/admins', '/api/admins/admin-id', '/api/app-settings'])(
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
  it('removes old routes and keeps OpenAPI consistent with HTTP responses', async () => {
    await request(app.getHttpServer()).post('/api/admin/login').send(credentials).expect(404);
    await request(app.getHttpServer()).get('/api/admin').expect(404);
    await request(app.getHttpServer()).put('/api/app-settings').send({ vatRate: 15 }).expect(404);
    const spec = SwaggerModule.createDocument(app, new DocumentBuilder().build());
    expect(spec.paths['/api/auth/admin/login']?.post?.responses['200']).toBeDefined();
    expect(spec.paths['/api/auth/admin/login']?.post?.responses['201']).toBeUndefined();
    expect(spec.paths['/api/app-settings']?.patch?.security).toContainEqual({ 'access-token': [] });
    expect(spec.paths['/api/app-settings']?.put).toBeUndefined();
  });
});
