import { TOKEN_SERVICE_TOKEN } from '@application/auth/services/token-service.token';
import { FavoritesService } from '@application/favorites/services/favorites.service';
import { TransformResponseInterceptor } from '@common/interceptors/transform-response.interceptor';
import { Test } from '@nestjs/testing';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { UnauthorizedException, ValidationPipe, type INestApplication } from '@nestjs/common';
import { I18nService } from 'nestjs-i18n';
import request from 'supertest';
import type { App } from 'supertest/types';
import { JwtAuthGuard } from '@presentation/auth/guards/jwt-auth.guard';
import { RolesGuard } from '@presentation/auth/guards/roles.guard';
import { FavoritesController } from './favorites.controller';
import { SWAGGER_BEARER_AUTH } from '@presentation/swagger/swagger.constants';

describe('Favorites HTTP and Swagger contract', () => {
  let app: INestApplication<App>;
  const unitId = '670d1234567890abcdef1237';
  const favoriteId = '670d1234567890abcdef1241';
  const unit = {
    id: unitId,
    user: '670d1234567890abcdef1239',
    title: 'Sea view apartment',
    description: 'A bright apartment near the sea.',
    address: 'Alexandria',
    photos: ['https://example.test/unit.jpg'],
    costPerDay: 1500,
    country: '670d1234567890abcdef1234',
    city: '670d1234567890abcdef1235',
    unitCategory: '670d1234567890abcdef1236',
    roomsCount: 2,
    adultsCount: 4,
    kidsCount: 0,
    hasInternetService: true,
    hasKitchen: true,
    hasPrivateGarage: false,
    availability: true,
    isActive: true,
    version: 1,
    ratingAverage: 4.8,
    ratingsCount: 12,
  };
  const favorite = {
    id: favoriteId,
    user: '670d1234567890abcdef1238',
    unit,
    createdAt: new Date('2026-11-24T12:00:00.000Z'),
  };
  const favoritesService = {
    add: jest.fn().mockResolvedValue(favorite),
    findMy: jest.fn().mockResolvedValue({
      data: [favorite],
      meta: {
        page: 1,
        limit: 10,
        total: 1,
        totalPages: 1,
        hasNextPage: false,
        hasPreviousPage: false,
      },
    }),
    remove: jest.fn().mockResolvedValue(undefined),
  };

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      controllers: [FavoritesController],
      providers: [
        { provide: FavoritesService, useValue: favoritesService },
        JwtAuthGuard,
        RolesGuard,
        { provide: I18nService, useValue: { translate: (key: string) => key } },
        {
          provide: TOKEN_SERVICE_TOKEN,
          useValue: {
            verifyAccessToken: (token: string) => {
              if (!['user', 'admin'].includes(token)) throw new UnauthorizedException();
              return Promise.resolve({ id: '670d1234567890abcdef1238', role: token });
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

  beforeEach(() => {
    jest.clearAllMocks();
    favoritesService.add.mockResolvedValue(favorite);
    favoritesService.findMy.mockResolvedValue({
      data: [favorite],
      meta: {
        page: 1,
        limit: 10,
        total: 1,
        totalPages: 1,
        hasNextPage: false,
        hasPreviousPage: false,
      },
    });
    favoritesService.remove.mockResolvedValue(undefined);
  });

  it('protects all favorite routes and restricts them to customer users', async () => {
    await request(app.getHttpServer()).put(`/api/favorites/${unitId}`).expect(401);
    await request(app.getHttpServer())
      .put(`/api/favorites/${unitId}`)
      .set('Authorization', 'Bearer admin')
      .expect(403);
    await request(app.getHttpServer()).get('/api/favorites/me').expect(401);
    await request(app.getHttpServer())
      .delete(`/api/favorites/${unitId}`)
      .set('Authorization', 'Bearer admin')
      .expect(403);
  });

  it('adds an active unit idempotently for the signed-in user', async () => {
    for (let attempt = 0; attempt < 2; attempt += 1) {
      await request(app.getHttpServer())
        .put(`/api/favorites/${unitId}`)
        .set('Authorization', 'Bearer user')
        .expect(200)
        .expect(({ body }) => {
          expect(body).toMatchObject({
            data: {
              id: favoriteId,
              unit: { id: unitId, title: 'Sea view apartment' },
            },
          });
        });
    }

    expect(favoritesService.add).toHaveBeenCalledTimes(2);
    expect(favoritesService.add).toHaveBeenCalledWith('670d1234567890abcdef1238', unitId);
  });

  it('validates unit ids and paginates the signed-in user favorites', async () => {
    favoritesService.findMy.mockResolvedValueOnce({
      data: [favorite],
      meta: {
        page: 2,
        limit: 5,
        total: 1,
        totalPages: 1,
        hasNextPage: false,
        hasPreviousPage: true,
      },
    });
    await request(app.getHttpServer())
      .put('/api/favorites/not-an-object-id')
      .set('Authorization', 'Bearer user')
      .expect(400);

    await request(app.getHttpServer())
      .get('/api/favorites/me')
      .set('Authorization', 'Bearer user')
      .query({ page: '2', limit: '5' })
      .expect(200)
      .expect(({ body }) => {
        expect(body).toMatchObject({
          data: [{ unit: { id: unitId } }],
          meta: { page: 2, limit: 5, total: 1 },
        });
      });

    expect(favoritesService.findMy).toHaveBeenCalledWith('670d1234567890abcdef1238', 2, 5);

    await request(app.getHttpServer())
      .get('/api/favorites/me')
      .set('Authorization', 'Bearer user')
      .query({ page: '0' })
      .expect(400);
  });

  it('removes a favorite and returns no content', async () => {
    for (let attempt = 0; attempt < 2; attempt += 1) {
      await request(app.getHttpServer())
        .delete(`/api/favorites/${unitId}`)
        .set('Authorization', 'Bearer user')
        .expect(204);
    }

    expect(favoritesService.remove).toHaveBeenCalledTimes(2);
    expect(favoritesService.remove).toHaveBeenCalledWith('670d1234567890abcdef1238', unitId);
  });

  it('publishes the authenticated favorite operations and response contracts in OpenAPI', () => {
    const document = SwaggerModule.createDocument(
      app,
      new DocumentBuilder()
        .addBearerAuth({ type: 'http', scheme: 'bearer' }, SWAGGER_BEARER_AUTH)
        .build(),
    );
    const favoritePath = document.paths['/api/favorites/{id}'];

    expect(favoritePath?.put?.operationId).toBe('favoritesAddUnit');
    expect(favoritePath?.delete?.operationId).toBe('favoritesRemoveUnit');
    expect(document.paths['/api/favorites/me']?.get?.operationId).toBe('favoritesFindMine');
    expect(favoritePath?.put?.security).toContainEqual({ [SWAGGER_BEARER_AUTH]: [] });
    expect(favoritePath?.put?.responses['200']).toBeDefined();
    expect(favoritePath?.delete?.responses['204']).toBeDefined();
    expect(document.components?.schemas?.UnitFavoriteResponseDto).toMatchObject({
      properties: {
        unit: { allOf: [{ $ref: '#/components/schemas/UnitResponseDto' }] },
      },
    });
  });
});
