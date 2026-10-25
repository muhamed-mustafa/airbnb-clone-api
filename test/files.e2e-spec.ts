import { type INestApplication, UnauthorizedException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import request from 'supertest';
import type { App } from 'supertest/types';
import { FilesModule } from '@app/files.module';
import { FILE_STORAGE } from '@application/files/tokens/file-storage.token';
import { FileStorageError } from '@application/files/errors/file-storage.error';
import { TOKEN_SERVICE_TOKEN } from '@application/auth/services/token-service.token';
import { TransformResponseInterceptor } from '@common/interceptors/transform-response.interceptor';
import { JwtAuthGuard } from '@presentation/auth/guards/jwt-auth.guard';
import { RolesGuard } from '@presentation/auth/guards/roles.guard';
import { GlobalExceptionFilter } from '@presentation/filters/global-exception-filter';
import { HttpExceptionFilter } from '@presentation/filters/http-exception.filter';
import { buildAudienceDocument } from '@presentation/swagger/swagger.documents';
import { AcceptLanguageResolver, I18nModule } from 'nestjs-i18n';
import { join } from 'node:path';
import englishErrors from '../src/common/i18n/en/errors.json';
import arabicErrors from '../src/common/i18n/ar/errors.json';

// Small image signatures exercise the real Nest magic-number validator, not a MIME mock.
const images = [
  {
    name: 'image.jpg',
    mime: 'image/jpeg',
    buffer: Buffer.from('ffd8ffe000104a46494600010100000100010000', 'hex'),
  },
  {
    name: 'image.png',
    mime: 'image/png',
    buffer: Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aL1sAAAAASUVORK5CYII=',
      'base64',
    ),
  },
  {
    name: 'image.webp',
    mime: 'image/webp',
    buffer: Buffer.from('524946461a00000057454250565038200e000000', 'hex'),
  },
];

describe('Files upload (e2e)', () => {
  let app: INestApplication<App>;
  const upload = jest.fn();
  const result = { key: 'airbnb/units/image-id', url: 'https://example.com/image.png' };
  const logger = { error: jest.fn(), debug: jest.fn(), info: jest.fn(), warn: jest.fn() };

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [
        FilesModule,
        I18nModule.forRoot({
          fallbackLanguage: 'en',
          loaderOptions: { path: join(__dirname, '../src/common/i18n/'), watch: false },
          resolvers: [AcceptLanguageResolver],
        }),
      ],
      providers: [
        JwtAuthGuard,
        RolesGuard,
        {
          provide: TOKEN_SERVICE_TOKEN,
          useValue: {
            verifyAccessToken: (token: string) => {
              if (!['user', 'admin'].includes(token)) throw new UnauthorizedException();
              return Promise.resolve({ id: 'principal-id', role: token });
            },
          },
        },
      ],
    })
      .overrideProvider(FILE_STORAGE)
      .useValue({ upload, delete: jest.fn() })
      .compile();
    app = module.createNestApplication();
    app.setGlobalPrefix('api');
    app.useGlobalGuards(module.get(JwtAuthGuard), module.get(RolesGuard));
    app.useGlobalInterceptors(new TransformResponseInterceptor());
    app.useGlobalFilters(new GlobalExceptionFilter(logger), new HttpExceptionFilter());
    await app.init();
  });
  beforeEach(() => {
    upload.mockReset().mockResolvedValue(result);
    logger.error.mockClear();
  });
  afterAll(async () => {
    await app.close();
  });

  const post = () =>
    request(app.getHttpServer()).post('/api/files/images').set('Authorization', 'Bearer user');

  it.each(images)(
    'uploads $mime through the real controller, pipe and use case',
    async ({ name, mime, buffer }) => {
      await post()
        .attach('file', buffer, { filename: name, contentType: mime })
        .expect(201)
        .expect({ data: result });
      expect(upload).toHaveBeenCalledTimes(1);
      expect(upload).toHaveBeenCalledWith({
        buffer,
        originalName: name,
        mimeType: mime,
        size: buffer.length,
      });
    },
  );

  it('rejects missing files', async () => {
    await post()
      .expect(400)
      .expect({ errors: [{ code: 'errors.BAD_REQUEST', message: englishErrors.BAD_REQUEST }] });
    expect(upload).not.toHaveBeenCalled();
  });
  it.each([
    { name: 'image.gif', mime: 'image/gif', buffer: Buffer.from('GIF89a01000100', 'ascii') },
    { name: 'spoof.png', mime: 'image/png', buffer: Buffer.from('plain text is not an image') },
    { name: 'empty.png', mime: 'image/png', buffer: Buffer.alloc(0) },
  ])('rejects invalid image $name', async ({ name, mime, buffer }) => {
    await post().attach('file', buffer, { filename: name, contentType: mime }).expect(400);
    expect(upload).not.toHaveBeenCalled();
  });
  it.each([
    { language: 'en', message: englishErrors.PAYLOAD_TOO_LARGE },
    { language: 'ar', message: arabicErrors.PAYLOAD_TOO_LARGE },
  ])(
    'rejects one byte above 5 MiB with a localized 413 in $language',
    async ({ language, message }) => {
      const buffer = Buffer.alloc(5 * 1024 * 1024 + 1);
      images[1].buffer.copy(buffer);
      await post()
        .set('Accept-Language', language)
        .attach('file', buffer, 'image.png')
        .expect(413)
        .expect({
          errors: [{ code: 'errors.PAYLOAD_TOO_LARGE', message }],
        });
      expect(upload).not.toHaveBeenCalled();
    },
  );
  it.each([5 * 1024 * 1024 - 1, 5 * 1024 * 1024])('accepts an image of %i bytes', async (size) => {
    const buffer = Buffer.alloc(size);
    images[1].buffer.copy(buffer);
    await post().attach('file', buffer, 'image.png').expect(201).expect({ data: result });
    expect(upload).toHaveBeenCalledTimes(1);
    expect(upload).toHaveBeenCalledWith({
      buffer,
      originalName: 'image.png',
      mimeType: 'image/png',
      size,
    });
  });
  it('rejects wrong fields and multiple files', async () => {
    await post().attach('image', images[1].buffer, 'image.png').expect(400);
    await post()
      .attach('file', images[1].buffer, 'first.png')
      .attach('file', images[1].buffer, 'second.png')
      .expect(400);
    expect(upload).not.toHaveBeenCalled();
  });
  it.each([
    { token: undefined, status: 401 },
    { token: 'invalid', status: 401 },
    { token: 'admin', status: 403 },
  ])('rejects unauthorized token $token', async ({ token, status }) => {
    const req = request(app.getHttpServer()).post('/api/files/images');
    if (token) req.set('Authorization', `Bearer ${token}`);
    await req.attach('file', images[1].buffer, 'image.png').expect(status);
    expect(upload).not.toHaveBeenCalled();
  });
  it.each([
    { language: 'en', message: englishErrors.INTERNAL_SERVER_ERROR },
    { language: 'ar', message: arabicErrors.INTERNAL_SERVER_ERROR },
  ])(
    'logs FileStorageError and returns only a generic 500 in $language',
    async ({ language, message }) => {
      const error = new FileStorageError('FILE_UPLOAD_FAILED: private provider diagnostic');
      upload.mockRejectedValue(error);
      await post()
        .set('Accept-Language', language)
        .attach('file', images[1].buffer, 'image.png')
        .expect(500)
        .expect({ errors: [{ code: 'INTERNAL_SERVER_ERROR', message }] });
      expect(logger.error).toHaveBeenCalledWith(error, 'Unhandled exception');
    },
  );
  it('keeps unexpected errors generic and out of the success envelope', async () => {
    const error = new Error('private stack and credential placeholder: do not expose');
    upload.mockRejectedValue(error);
    await post()
      .attach('file', images[1].buffer, 'image.png')
      .expect(500)
      .expect({
        errors: [{ code: 'INTERNAL_SERVER_ERROR', message: englishErrors.INTERNAL_SERVER_ERROR }],
      });
    expect(logger.error).toHaveBeenCalledWith(error, 'Unhandled exception');
  });
  it('documents the multipart input, responses and user audience', () => {
    const source = SwaggerModule.createDocument(app, new DocumentBuilder().build());
    const success = {
      content: {
        'application/json': {
          schema: {
            type: 'object',
            required: ['data'],
            properties: {
              data: {
                type: 'object',
                required: ['key', 'url'],
                properties: {
                  key: { type: 'string' },
                  url: { type: 'string', format: 'uri' },
                },
              },
            },
          },
        },
      },
    };
    expect(source.paths['/api/files/images']?.post?.responses['201']).toMatchObject(success);
    const user = buildAudienceDocument(source, 'user');
    const operation = user.paths['/api/files/images']?.post;
    expect(operation?.responses['201']).toEqual(
      source.paths['/api/files/images']?.post?.responses['201'],
    );
    expect(operation?.responses['201']).toMatchObject(success);
    expect(operation?.responses['413']).toMatchObject({
      content: {
        'application/json': {
          example: {
            errors: [
              { code: 'errors.PAYLOAD_TOO_LARGE', message: englishErrors.PAYLOAD_TOO_LARGE },
            ],
          },
        },
      },
    });
    expect(operation).toMatchObject({
      security: [{ 'access-token': [] }],
      'x-docs-roles': ['user'],
      requestBody: {
        required: true,
        content: {
          'multipart/form-data': {
            schema: {
              required: ['file'],
              properties: { file: { type: 'string', format: 'binary' } },
            },
          },
        },
      },
    });
    expect(operation?.description).toMatch(/JPEG, PNG or WebP/);
    expect(operation?.description).toContain('5,242,880');
    for (const status of ['201', '400', '401', '403', '413', '500'])
      expect(operation?.responses[status]).toBeDefined();
    expect(operation?.responses['201']).toMatchObject({
      content: {
        'application/json': {
          schema: {
            required: ['data'],
            properties: { data: { required: ['key', 'url'] } },
          },
        },
      },
    });
    expect(buildAudienceDocument(source, 'admin').paths['/api/files/images']).toBeUndefined();
    expect(buildAudienceDocument(source, 'shared').paths['/api/files/images']).toBeUndefined();
  });
});
