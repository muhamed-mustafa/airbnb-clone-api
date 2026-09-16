import { type INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SwaggerModule } from '@nestjs/swagger';
import type { EnvironmentVariables } from '@common/config/env.types';
import { SWAGGER_UI_CUSTOM_CSS } from './swagger-ui.css';
import { buildSwaggerUiCustomJs, SWAGGER_UI_FAVICON } from './swagger-ui.script';
import { buildSwaggerDocument } from './swagger.config';
import { SWAGGER_API_TITLE, SWAGGER_PATH } from './swagger.constants';

type SwaggerSortableOperation = {
  get?: (key: string) => unknown;
  getIn?: (path: string[]) => unknown;
  operation?: Record<string, unknown>;
  path?: string;
  method?: string;
};

type SwaggerRequest = {
  body?: unknown;
  headers?: Record<string, string>;
  method?: string;
  url?: string;
};

type SwaggerResponse = {
  body?: unknown;
  data?: unknown;
  obj?: unknown;
  text?: unknown;
};

type SwaggerDocsBridge = {
  getAcceptedLanguage?: () => string;
  storeTokensFromResponse?: (body: unknown) => void;
};

type SwaggerBrowserGlobal = typeof globalThis & {
  AirbnbCloneApiDocs?: SwaggerDocsBridge;
  localStorage?: {
    getItem: (key: string) => string | null;
  };
};

const swaggerOperationsSorter = (
  left: SwaggerSortableOperation,
  right: SwaggerSortableOperation,
): number => {
  const readTopLevelValue = (item: SwaggerSortableOperation, key: string): unknown => {
    if (typeof item.get === 'function') {
      return item.get(key);
    }

    return item[key as keyof SwaggerSortableOperation];
  };

  const readOperationValue = (item: SwaggerSortableOperation, key: string): unknown => {
    if (typeof item.getIn === 'function') {
      return item.getIn(['operation', key]);
    }

    const operation = readTopLevelValue(item, 'operation');

    if (typeof operation === 'object' && operation !== null) {
      return (operation as Record<string, unknown>)[key];
    }

    return undefined;
  };

  const readOrder = (item: SwaggerSortableOperation): number => {
    const order = Number(readOperationValue(item, 'x-docs-order'));
    return Number.isFinite(order) ? order : 1000;
  };

  const readText = (item: SwaggerSortableOperation, key: string): string => {
    const value = readTopLevelValue(item, key);
    return typeof value === 'string' ? value : '';
  };

  const methodOrder: Record<string, number> = {
    post: 10,
    get: 20,
    put: 30,
    patch: 40,
    delete: 50,
  };

  const leftOrder = readOrder(left);
  const rightOrder = readOrder(right);

  if (leftOrder !== rightOrder) {
    return leftOrder - rightOrder;
  }

  const leftMethod = readText(left, 'method').toLowerCase();
  const rightMethod = readText(right, 'method').toLowerCase();
  const leftMethodOrder = methodOrder[leftMethod] ?? 100;
  const rightMethodOrder = methodOrder[rightMethod] ?? 100;

  if (leftMethodOrder !== rightMethodOrder) {
    return leftMethodOrder - rightMethodOrder;
  }

  return readText(left, 'path').localeCompare(readText(right, 'path'));
};

const swaggerTagsSorter = (left: string, right: string): number => {
  const tagOrder: Record<string, number> = {
    Authentication: 10,
    Users: 20,
  };

  const leftOrder = tagOrder[left] ?? 1000;
  const rightOrder = tagOrder[right] ?? 1000;

  if (leftOrder !== rightOrder) {
    return leftOrder - rightOrder;
  }

  return left.localeCompare(right);
};

const swaggerRequestInterceptor = (request: SwaggerRequest): SwaggerRequest => {
  const browserGlobal = globalThis as SwaggerBrowserGlobal;
  const storedLanguage =
    browserGlobal.AirbnbCloneApiDocs?.getAcceptedLanguage?.() ??
    browserGlobal.localStorage?.getItem('airbnb-clone-api.docs.accept-language') ??
    'en';
  const acceptedLanguage = ['en', 'ar'].includes(storedLanguage) ? storedLanguage : 'en';
  const storedRefreshToken =
    browserGlobal.localStorage?.getItem('airbnb-clone-api.docs.refresh-token') ?? '';

  request.headers = {
    ...(request.headers ?? {}),
    'Accept-Language': acceptedLanguage,
  };

  const requestMethod = request.method?.toUpperCase();
  const requestUrl = request.url ?? '';

  if (
    requestMethod === 'POST' &&
    requestUrl.endsWith('/api/auth/refresh-token') &&
    storedRefreshToken
  ) {
    const shouldUseStoredToken = (token: unknown): boolean => {
      const currentToken = typeof token === 'string' ? token.trim() : '';

      return !currentToken || currentToken.includes('example-refresh-token');
    };

    if (!request.body) {
      request.body = JSON.stringify({ token: storedRefreshToken });
    } else if (typeof request.body === 'string') {
      try {
        const parsedBody = JSON.parse(request.body) as Record<string, unknown>;

        if (shouldUseStoredToken(parsedBody.token)) {
          request.body = JSON.stringify({
            ...parsedBody,
            token: storedRefreshToken,
          });
        }
      } catch {
        request.body = JSON.stringify({ token: storedRefreshToken });
      }
    } else if (typeof request.body === 'object' && request.body !== null) {
      const parsedBody = request.body as Record<string, unknown>;

      if (shouldUseStoredToken(parsedBody.token)) {
        request.body = JSON.stringify({
          ...parsedBody,
          token: storedRefreshToken,
        });
      }
    }
  }

  return request;
};

const swaggerResponseInterceptor = <TResponse extends SwaggerResponse>(
  response: TResponse,
): TResponse => {
  const browserGlobal = globalThis as SwaggerBrowserGlobal;
  const responseBody = response.data ?? response.body ?? response.obj ?? response.text;

  browserGlobal.AirbnbCloneApiDocs?.storeTokensFromResponse?.(responseBody);

  return response;
};

export const setupSwagger = (app: INestApplication): void => {
  const configService = app.get<ConfigService<EnvironmentVariables, true>>(ConfigService);
  const runtimeEnvironment = process.env.NODE_ENV ?? 'development';

  const swaggerConfig = buildSwaggerDocument(configService);
  const document = SwaggerModule.createDocument(app, swaggerConfig);

  SwaggerModule.setup(SWAGGER_PATH, app, document, {
    useGlobalPrefix: true,
    customSiteTitle: SWAGGER_API_TITLE,
    customCss: SWAGGER_UI_CUSTOM_CSS,
    customJsStr: buildSwaggerUiCustomJs(runtimeEnvironment),
    customfavIcon: SWAGGER_UI_FAVICON,
    swaggerOptions: {
      persistAuthorization: true,
      deepLinking: true,
      docExpansion: 'list',
      filter: true,
      fn: {
        opsFilter: (
          taggedOperations: {
            filter: (predicate: (value: unknown, tag: string) => boolean) => unknown;
          },
          phrase: string,
        ) =>
          taggedOperations.filter((_value, tag) =>
            tag.toLowerCase().includes(phrase.toLowerCase()),
          ),
      },
      displayRequestDuration: true,
      tryItOutEnabled: true,
      requestInterceptor: swaggerRequestInterceptor,
      responseInterceptor: swaggerResponseInterceptor,
      syntaxHighlight: {
        activate: true,
        theme: 'monokai',
      },
      operationsSorter: swaggerOperationsSorter,
      tagsSorter: swaggerTagsSorter,
    },
  });
};
