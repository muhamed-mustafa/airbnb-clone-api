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
      imports: [FilesModule],
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
      .expect({ errors: [{ code: 'errors.BAD_REQUEST', message: 'errors.BAD_REQUEST' }] });
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
  it('rejects an image one byte above 5 MB with the existing 413 error envelope', async () => {
    const buffer = Buffer.alloc(5 * 1024 * 1024 + 1);
    images[1].buffer.copy(buffer);
    await post()
      .attach('file', buffer, 'image.png')
      .expect(413)
      .expect({
        errors: [{ code: 'errors.INTERNAL_SERVER_ERROR', message: 'errors.INTERNAL_SERVER_ERROR' }],
      });
    expect(upload).not.toHaveBeenCalled();
  });
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
  it('returns a sanitized 500 when storage fails', async () => {
    upload.mockRejectedValue(new FileStorageError('FILE_UPLOAD_FAILED'));
    await post()
      .attach('file', images[1].buffer, 'image.png')
      .expect(500)
      .expect({ errors: [{ message: 'Internal server error' }] });
    expect(logger.error).toHaveBeenCalled();
  });
  it('documents the multipart input, responses and user audience', () => {
    const source = SwaggerModule.createDocument(app, new DocumentBuilder().build());
    const user = buildAudienceDocument(source, 'user');
    const operation = user.paths['/api/files/images']?.post;
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
