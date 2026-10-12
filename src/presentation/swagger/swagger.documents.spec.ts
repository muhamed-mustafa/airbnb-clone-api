import type { INestApplication } from '@nestjs/common';
import type { OpenAPIObject } from '@nestjs/swagger';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { Test } from '@nestjs/testing';
import { AdminAuthController } from '../admin/admin-auth.controller';
import { AdminController } from '../admin/admin.controller';
import { AppSettingsController } from '../app-settings/app-settings.controller';
import { AuthController } from '../auth/auth.controller';
import { CityController } from '../cities/city.controller';
import { CountryController } from '../countries/country.controller';
import { CurrencyController } from '../currencies/currency.controller';
import { UnitCategoryController } from '../unit-categories/unit-category.controller';
import { UnitsController } from '../units/units.controller';
import { UsersController } from '../users/users.controller';
import { buildAudienceDocument, DOCS_AUDIENCES } from './swagger.documents';

describe('Swagger audience documents from actual controllers', () => {
  let app: INestApplication;
  let source: OpenAPIObject;
  beforeAll(async () => {
    const controllers = [
      AuthController,
      AdminController,
      AdminAuthController,
      CountryController,
      CityController,
      CurrencyController,
      UnitCategoryController,
      AppSettingsController,
      UsersController,
      UnitsController,
    ];
    const dependencies = new Set<new (...args: never[]) => unknown>();
    for (const controller of controllers) {
      const types = Reflect.getMetadata('design:paramtypes', controller) as (new (
        ...args: never[]
      ) => unknown)[];
      types?.forEach((type) => dependencies.add(type));
    }
    const module = await Test.createTestingModule({
      controllers,
      providers: [...dependencies].map((provide) => ({ provide, useValue: {} })),
    }).compile();
    app = module.createNestApplication();
    app.setGlobalPrefix('api');
    source = SwaggerModule.createDocument(app, new DocumentBuilder().setTitle('API').build());
  });
  afterAll(async () => {
    await app.close();
  });

  it('places each operation in exactly one audience and retains response schemas', () => {
    const documents = DOCS_AUDIENCES.map((audience) => buildAudienceDocument(source, audience));
    const methods = ['get', 'post', 'patch', 'put', 'delete'] as const;
    for (const [path, item] of Object.entries(source.paths)) {
      for (const method of methods) {
        if (item[method])
          expect(documents.filter((document) => document.paths[path]?.[method])).toHaveLength(1);
      }
    }
    documents.forEach((document) => {
      for (const [name, schema] of Object.entries(document.components?.schemas ?? {})) {
        expect(schema).toEqual(source.components?.schemas?.[name]);
      }
    });
    expect(documents[0].components?.schemas?.AdminResponseDto).toBeUndefined();
    expect(documents[0].components?.schemas?.AuthResponseDto).toBeDefined();
  });

  it('splits public reference reads from admin writes without mutating the source', () => {
    const original = structuredClone(source);
    const admin = buildAudienceDocument(source, 'admin');
    const shared = buildAudienceDocument(source, 'shared');
    for (const resource of ['countries', 'cities', 'currencies', 'unit-categories']) {
      expect(admin.paths[`/api/${resource}`]?.post).toBeDefined();
      expect(admin.paths[`/api/${resource}`]?.get).toBeUndefined();
      expect(shared.paths[`/api/${resource}`]?.get).toMatchObject({
        security: [],
        'x-docs-access': 'Public',
      });
      expect(shared.paths[`/api/${resource}`]?.post).toBeUndefined();
    }
    expect(source).toEqual(original);
  });

  it('separates sign-in audiences while sharing refresh and identity', () => {
    const user = buildAudienceDocument(source, 'user');
    const admin = buildAudienceDocument(source, 'admin');
    const shared = buildAudienceDocument(source, 'shared');
    expect(user.paths['/api/auth/login']?.post).toBeDefined();
    expect(user.paths['/api/auth/register']?.post).toBeDefined();
    expect(admin.paths['/api/auth/admin/login']?.post).toMatchObject({ 'x-docs-access': 'Public' });
    expect(shared.paths['/api/auth/me']?.get).toMatchObject({ 'x-docs-access': 'Admin + User' });
    expect(shared.paths['/api/auth/refresh-token']?.post).toBeDefined();
    expect(admin.paths['/api/app-settings']?.get).toBeDefined();
    expect(shared.paths['/api/app-settings']).toBeUndefined();
    expect(user.tags).toEqual([{ name: 'Authentication' }, { name: 'Units' }]);
    expect(admin.tags?.some((tag) => tag.name.startsWith('Admin /'))).toBe(false);
  });

  it('documents the production response envelope and preserves paginated lists', () => {
    const user = buildAudienceDocument(source, 'user');
    const shared = buildAudienceDocument(source, 'shared');
    expect(user.paths['/api/auth/login']?.post?.responses['200']).toMatchObject({
      content: {
        'application/json': {
          schema: {
            type: 'object',
            required: ['data'],
            properties: { data: { $ref: '#/components/schemas/AuthResponseDto' } },
          },
        },
      },
    });
    expect(shared.paths['/api/countries']?.get?.responses['200']).toMatchObject({
      content: {
        'application/json': {
          schema: { properties: { data: { type: 'array' }, meta: { type: 'object' } } },
        },
      },
    });
  });
  it('documents units only for users with complete JSON request and wrapped response schemas', () => {
    const user = buildAudienceDocument(source, 'user');
    const operation = user.paths['/api/units']?.post;
    expect(operation).toMatchObject({
      operationId: 'unitsCreate',
      tags: ['Units'],
      security: [{ 'access-token': [] }],
    });
    expect(buildAudienceDocument(source, 'admin').paths['/api/units']).toBeUndefined();
    expect(buildAudienceDocument(source, 'shared').paths['/api/units']).toBeUndefined();
    const input = user.components?.schemas?.CreateUnitDto;
    expect(input).toMatchObject({
      required: [
        'title',
        'description',
        'address',
        'photos',
        'costPerDay',
        'country',
        'city',
        'unitCategory',
        'roomsCount',
        'adultsCount',
        'kidsCount',
        'hasInternetService',
        'hasKitchen',
        'hasPrivateGarage',
        'availability',
      ],
      properties: {
        title: { minLength: 5, maxLength: 100 },
        photos: { type: 'array', minItems: 1, items: { type: 'string' } },
        roomsCount: { type: 'integer', minimum: 1 },
        kidsCount: { type: 'integer', minimum: 0 },
        hasKitchen: { type: 'boolean' },
      },
    });
    expect(input && 'properties' in input && input.properties?.user).toBeUndefined();
    expect(operation?.requestBody).toMatchObject({
      content: { 'application/json': { schema: { $ref: '#/components/schemas/CreateUnitDto' } } },
    });
    expect(operation?.responses['201']).toMatchObject({
      content: {
        'application/json': {
          schema: { properties: { data: { $ref: '#/components/schemas/UnitResponseDto' } } },
        },
      },
    });
    expect(user.components?.schemas?.UnitResponseDto).toMatchObject({
      properties: {
        id: { type: 'string' },
        photos: { type: 'array' },
        costPerDay: { type: 'number' },
      },
    });
    expect(Object.keys(operation!.responses)).toEqual(
      expect.arrayContaining(['201', '400', '401', '403', '404', '500']),
    );
  });
  it('documents retrieval and partial updates only for the user audience', () => {
    const user = buildAudienceDocument(source, 'user');
    const path = user.paths['/api/units/{id}'];
    expect(path?.get).toMatchObject({
      operationId: 'unitsFindOne',
      tags: ['Units'],
      security: [{ 'access-token': [] }],
      parameters: [{ name: 'id', in: 'path', required: true }],
    });
    expect(path?.patch).toMatchObject({
      operationId: 'unitsUpdate',
      security: [{ 'access-token': [] }],
      requestBody: {
        content: { 'application/json': { schema: { $ref: '#/components/schemas/UpdateUnitDto' } } },
      },
    });
    for (const audience of ['admin', 'shared'] as const)
      expect(buildAudienceDocument(source, audience).paths['/api/units/{id}']).toBeUndefined();
    const update = user.components?.schemas?.UpdateUnitDto;
    expect(update && 'required' in update ? (update.required ?? []) : []).toEqual([]);
    expect(update).toMatchObject({
      properties: {
        availability: { type: 'boolean' },
        title: { minLength: 5, maxLength: 100 },
        costPerDay: { minimum: 1 },
      },
    });
    expect(update && 'properties' in update ? update.properties?.user : undefined).toBeUndefined();
    expect(user.components?.schemas?.UnitResponseDto).toMatchObject({
      properties: { user: { type: 'string' }, availability: { type: 'boolean' } },
    });
    for (const operation of [path?.get, path?.patch])
      expect(operation?.responses['200']).toMatchObject({
        content: {
          'application/json': {
            schema: { properties: { data: { $ref: '#/components/schemas/UnitResponseDto' } } },
          },
        },
      });
    expect(path?.patch?.responses['403']).toMatchObject({
      content: {
        'application/json': { examples: { notOwner: { value: { code: 'UNIT_ACCESS_DENIED' } } } },
      },
    });
    expect(Object.keys(path.patch!.responses)).toEqual(
      expect.arrayContaining(['200', '400', '401', '403', '404', '500']),
    );
  });
});
