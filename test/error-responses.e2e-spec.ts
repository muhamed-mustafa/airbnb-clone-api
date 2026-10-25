import { Controller, Get, HttpException, type INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { AcceptLanguageResolver, I18nModule, I18nService } from 'nestjs-i18n';
import { join } from 'node:path';
import request from 'supertest';
import type { App } from 'supertest/types';
import { ApplicationError } from '@common/errors/application.error';
import { ApplicationExceptionFilter } from '@presentation/filters/application-exception.filter';
import { GlobalExceptionFilter } from '@presentation/filters/global-exception-filter';
import { HttpExceptionFilter } from '@presentation/filters/http-exception.filter';
import enErrors from '../src/common/i18n/en/errors.json';
import arErrors from '../src/common/i18n/ar/errors.json';
import enUnits from '../src/common/i18n/en/units.json';
import arUnits from '../src/common/i18n/ar/units.json';

@Controller('errors')
class ErrorsController {
  @Get('application')
  application() {
    throw new ApplicationError('UNIT_NOT_FOUND');
  }

  @Get('http')
  http() {
    throw new HttpException({ code: 'errors.BAD_REQUEST', field: 'unitId' }, 422);
  }

  @Get('http-default')
  httpDefault() {
    throw new HttpException({ message: 'private details' }, 404);
  }

  @Get('http-string')
  httpString() {
    throw new HttpException('errors.FORBIDDEN', 403);
  }

  @Get('unexpected')
  unexpected() {
    throw new Error('private storage credentials');
  }

  @Get('unknown')
  unknown() {
    // Exercise the catch-all filter with a non-Error value.
    // eslint-disable-next-line @typescript-eslint/only-throw-error
    throw 'private non-Error failure';
  }
}

describe('Exception response contract', () => {
  let app: INestApplication<App>;
  const logger = { error: jest.fn(), debug: jest.fn(), info: jest.fn(), warn: jest.fn() };

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      controllers: [ErrorsController],
      imports: [
        I18nModule.forRoot({
          fallbackLanguage: 'en',
          loaderOptions: { path: join(__dirname, '../src/common/i18n/'), watch: false },
          resolvers: [AcceptLanguageResolver],
        }),
      ],
    }).compile();
    app = module.createNestApplication();
    app.useGlobalFilters(
      new GlobalExceptionFilter(logger),
      new HttpExceptionFilter(),
      new ApplicationExceptionFilter(module.get(I18nService)),
    );
    await app.init();
  });

  beforeEach(() => logger.error.mockClear());
  afterAll(async () => app.close());

  it.each([
    { language: 'en', errors: enErrors, units: enUnits },
    { language: 'ar', errors: arErrors, units: arUnits },
  ])(
    'preserves status, localization and safe error items in $language',
    async ({ language, errors, units }) => {
      const get = (path: string) =>
        request(app.getHttpServer()).get(`/errors/${path}`).set('Accept-Language', language);
      await get('application')
        .expect(404)
        .expect({
          errors: [{ code: 'UNIT_NOT_FOUND', message: units.UNIT_NOT_FOUND }],
        });
      await get('http')
        .expect(422)
        .expect({
          errors: [{ code: 'errors.BAD_REQUEST', message: errors.BAD_REQUEST, field: 'unitId' }],
        });
      await get('http-default')
        .expect(404)
        .expect({
          errors: [{ code: 'errors.NOT_FOUND', message: errors.NOT_FOUND }],
        });
      await get('http-string')
        .expect(403)
        .expect({
          errors: [{ code: 'errors.FORBIDDEN', message: errors.FORBIDDEN }],
        });
      expect(logger.error).not.toHaveBeenCalled();
      for (const path of ['unexpected', 'unknown']) {
        await get(path)
          .expect(500)
          .expect({
            errors: [{ code: 'INTERNAL_SERVER_ERROR', message: errors.INTERNAL_SERVER_ERROR }],
          });
      }
      expect(logger.error).toHaveBeenCalledTimes(2);
      expect(logger.error).toHaveBeenCalledWith(expect.any(Error), 'Unhandled exception');
      expect(logger.error).toHaveBeenCalledWith(
        new Error('private storage credentials'),
        'Unhandled exception',
      );
    },
  );
});
