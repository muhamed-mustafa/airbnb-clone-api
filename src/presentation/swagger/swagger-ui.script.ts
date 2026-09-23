import {
  SWAGGER_ACCEPTED_LANGUAGES,
  SWAGGER_API_TITLE,
  SWAGGER_API_VERSION,
  SWAGGER_BEARER_AUTH,
} from './swagger.constants';

const toJavaScriptString = (value: unknown): string => JSON.stringify(value);

const formatEnvironmentName = (environment: string): string =>
  environment
    .trim()
    .replace(/[-_]+/g, ' ')
    .replace(/\s+/g, ' ')
    .replace(/\b\w/g, (character) => character.toUpperCase());

export const SWAGGER_UI_FAVICON =
  'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"%3E%3Crect width="64" height="64" rx="16" fill="%23ff385c"/%3E%3Cpath d="M18 46 32 14l14 32h-8l-2.6-6.6H28.6L26 46h-8Zm13-14h2l-1-2.7L31 32Z" fill="white"/%3E%3C/svg%3E';

export const buildSwaggerUiCustomJs = (runtimeEnvironment: string): string => {
  const environment = formatEnvironmentName(runtimeEnvironment || 'development');

  return `
(() => {
  const portalConfig = Object.freeze({
    title: ${toJavaScriptString(SWAGGER_API_TITLE)},
    version: ${toJavaScriptString(SWAGGER_API_VERSION)},
    environment: ${toJavaScriptString(environment)},
    authSchemeName: ${toJavaScriptString(SWAGGER_BEARER_AUTH)},
    supportedLanguages: Object.freeze(${toJavaScriptString(SWAGGER_ACCEPTED_LANGUAGES)}),
  });

  const storageKeys = Object.freeze({
    accessToken: 'airbnb-clone-api.docs.access-token',
    refreshToken: 'airbnb-clone-api.docs.refresh-token',
    acceptLanguage: 'airbnb-clone-api.docs.accept-language',
  });

  let languagePanelElements = null;

  const enforceLightTheme = () => {
    document.documentElement.classList.remove('dark-mode');
  };

  const getStorage = () => {
    try {
      return window.localStorage;
    } catch {
      return undefined;
    }
  };

  const readStoredValue = (key) => {
    return getStorage()?.getItem(key) || '';
  };

  const writeStoredValue = (key, value) => {
    const storage = getStorage();

    if (!storage) {
      return;
    }

    if (value) {
      storage.setItem(key, value);
      return;
    }

    storage.removeItem(key);
  };

  const normalizeToken = (value) => {
    return String(value || '').replace(/^Bearer\\s+/i, '').trim();
  };

  const getAcceptedLanguage = () => {
    const storedLanguage = readStoredValue(storageKeys.acceptLanguage);
    const fallbackLanguage = portalConfig.supportedLanguages[0]?.value || 'en';

    return portalConfig.supportedLanguages.some((language) => language.value === storedLanguage)
      ? storedLanguage
      : fallbackLanguage;
  };

  const authorizeAccessToken = (value) => {
    const token = normalizeToken(value);
    const ui = window.ui;

    if (!ui?.authActions) {
      return;
    }

    if (!token) {
      ui.authActions.logout?.([portalConfig.authSchemeName]);
      return;
    }

    ui.authActions.authorize({
      [portalConfig.authSchemeName]: {
        name: portalConfig.authSchemeName,
        schema: {
          type: 'http',
          in: 'header',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
        value: token,
      },
    });
  };

  const setLanguageStatus = (message) => {
    if (languagePanelElements?.status) {
      languagePanelElements.status.textContent = message;
    }
  };

  const maskToken = (token) => {
    const normalizedToken = normalizeToken(token);

    if (!normalizedToken) {
      return 'No refresh token captured yet';
    }

    if (normalizedToken.length <= 12) {
      return 'Stored automatically';
    }

    return 'Stored automatically ...' + normalizedToken.slice(-8);
  };

  const syncAuthorizeRefreshTokenField = () => {
    const output = document.querySelector('#api-docs-authorize-refresh-token');

    if (output) {
      const token = readStoredValue(storageKeys.refreshToken);
      output.textContent = maskToken(token);
      output.dataset.state = token ? 'stored' : 'empty';
      output.setAttribute(
        'aria-label',
        token ? 'Refresh token captured automatically' : 'No refresh token captured yet',
      );
    }
  };

  const syncRequestPreferences = () => {
    if (languagePanelElements) {
      languagePanelElements.acceptLanguage.value = getAcceptedLanguage();
      const selectedLabel =
        languagePanelElements.acceptLanguage.selectedOptions[0]?.textContent ||
        languagePanelElements.acceptLanguage.value;
      setLanguageStatus('Requests use ' + selectedLabel + '.');
    }

    syncAuthorizeRefreshTokenField();
  };

  const readAuthorizedAccessToken = () => {
    const authorized = window.ui?.getState?.().get('auth')?.get('authorized');
    const scheme = authorized?.get?.(portalConfig.authSchemeName);
    const value = scheme?.get?.('value') || scheme?.value;

    return normalizeToken(value);
  };

  const syncStoredAccessTokenFromNativeAuthorize = () => {
    const token = readAuthorizedAccessToken();

    if (!token) {
      return;
    }

    writeStoredValue(storageKeys.accessToken, token);

  };

  const findRefreshTokenPath = () => {
    const paths = window.ui?.specSelectors?.specJson?.()?.get?.('paths');
    const pathNames = paths?.keySeq?.().toArray?.() || [];

    return pathNames.find((pathName) => pathName.endsWith('/auth/refresh-token'));
  };

  // Mirrors the latest captured refresh token into the Refresh Token request body editor.
  const syncRefreshTokenRequestBody = () => {
    const token = readStoredValue(storageKeys.refreshToken);
    const path = findRefreshTokenPath();
    const setRequestBodyValue = window.ui?.oas3Actions?.setRequestBodyValue;

    if (!token || !path || !setRequestBodyValue) {
      return false;
    }

    setRequestBodyValue({
      value: JSON.stringify({ token }, null, 2),
      pathMethod: [path, 'post'],
    });

    return true;
  };

  // Replaces the example body with the stored token whenever the operation is opened.
  const prefillRefreshTokenRequestBody = () => {
    const path = findRefreshTokenPath();
    const editor = path
      ? document.querySelector(
          '.opblock.is-open .opblock-summary-path[data-path="' + path + '"]',
        )
          ?.closest('.opblock')
          ?.querySelector('textarea.body-param__text')
      : null;

    if (!editor || editor.dataset.apiDocsRefreshTokenPrefilled) {
      return;
    }

    editor.dataset.apiDocsRefreshTokenPrefilled = 'true';

    if (!editor.value.trim() || editor.value.includes('example-refresh-token')) {
      syncRefreshTokenRequestBody();
    }
  };

  const parseMaybeJson = (candidate) => {
    if (!candidate) {
      return undefined;
    }

    if (typeof candidate === 'string') {
      try {
        return JSON.parse(candidate);
      } catch {
        return undefined;
      }
    }

    return candidate;
  };

  const storeTokensFromResponse = (body) => {
    const parsedBody = parseMaybeJson(body);
    const payload =
      parsedBody && typeof parsedBody === 'object' && parsedBody.data && typeof parsedBody.data === 'object'
        ? parsedBody.data
        : parsedBody;

    if (!payload || typeof payload !== 'object') {
      return;
    }

    const accessToken = normalizeToken(payload.accessToken);
    const refreshToken = normalizeToken(payload.refreshToken);

    if (!accessToken && !refreshToken) {
      return;
    }

    writeStoredValue(storageKeys.accessToken, accessToken || readStoredValue(storageKeys.accessToken));
    writeStoredValue(storageKeys.refreshToken, refreshToken || readStoredValue(storageKeys.refreshToken));

    if (accessToken) {
      authorizeAccessToken(accessToken);
    }

    syncRequestPreferences();
    syncAuthorizeRefreshTokenField();

    if (refreshToken) {
      syncRefreshTokenRequestBody();
    }
  };

  window.AirbnbCloneApiDocs = {
    authorizeAccessToken,
    getAcceptedLanguage,
    syncRequestPreferences,
    storeTokensFromResponse,
  };

  const createText = (tagName, className, text) => {
    const element = document.createElement(tagName);
    element.className = className;
    element.textContent = text;
    return element;
  };

  const createMetaItem = (label) => {
    const item = document.createElement('li');
    item.textContent = label;
    return item;
  };

  const createPortalCard = (label, value) => {
    const card = document.createElement('div');
    card.className = 'api-portal-card';

    const labelElement = document.createElement('span');
    labelElement.textContent = label;

    const valueElement = document.createElement('strong');
    valueElement.textContent = value;

    card.append(labelElement, valueElement);
    return card;
  };

  const mountHero = () => {
    const root = document.getElementById('swagger-ui');
    const topbar = root?.querySelector('.topbar');

    if (!root || !topbar || document.querySelector('.api-portal-hero')) {
      return;
    }

    const hero = document.createElement('section');
    hero.className = 'api-portal-hero';
    hero.setAttribute('aria-label', 'API documentation overview');

    const shell = document.createElement('div');
    shell.className = 'api-portal-shell';

    const copy = document.createElement('div');
    copy.className = 'api-portal-copy';
    copy.append(
      createText('p', 'api-portal-kicker', 'Developer portal'),
      createText('h1', 'api-portal-title', portalConfig.title),
      createText(
        'p',
        'api-portal-summary',
        'REST API documentation for authentication, user management, localized validation, and JWT token flows.',
      ),
    );

    const meta = document.createElement('ul');
    meta.className = 'api-portal-meta';
    meta.append(
      createMetaItem('OpenAPI'),
      createMetaItem('Version ' + portalConfig.version),
      createMetaItem(portalConfig.environment),
      createMetaItem('Bearer JWT'),
    );
    copy.appendChild(meta);

    const panel = document.createElement('aside');
    panel.className = 'api-portal-panel';
    panel.setAttribute('aria-label', 'Documentation capabilities');
    panel.appendChild(createText('p', 'api-portal-panel-title', 'At a glance'));

    const cards = document.createElement('div');
    cards.className = 'api-portal-cards';
    cards.append(
      createPortalCard('Auth', 'Access + refresh tokens'),
      createPortalCard('Errors', 'Validation + HTTP errors'),
      createPortalCard('Locale', 'Accept-Language: en or ar'),
      createPortalCard('Server', 'Selectable in Swagger UI'),
    );
    panel.appendChild(cards);

    shell.append(copy, panel);
    hero.appendChild(shell);
    topbar.after(hero);
    document.body.classList.add('swagger-portal-ready');
  };

  const mountLanguagePanel = () => {
    const hero = document.querySelector('.api-portal-hero');

    if (!hero || document.querySelector('.api-docs-language-panel')) {
      return;
    }

    const panel = document.createElement('section');
    panel.className = 'api-docs-language-panel';
    panel.setAttribute('aria-label', 'Request language preference');

    const shell = document.createElement('div');
    shell.className = 'api-docs-language-panel-shell';

    const copy = document.createElement('div');
    copy.className = 'api-docs-language-panel-copy';
    copy.append(
      createText('p', 'api-docs-language-panel-kicker', 'Request preference'),
      createText('h2', 'api-docs-language-panel-title', 'Accepted Language'),
      createText(
        'p',
        'api-docs-language-panel-summary',
        'Swagger sends this value as the Accept-Language header for every request.',
      ),
    );

    const control = document.createElement('label');
    control.className = 'api-docs-language-panel-control';

    const controlLabel = document.createElement('span');
    controlLabel.textContent = 'Language';

    const languageSelect = document.createElement('select');
    languageSelect.id = 'api-docs-accept-language';
    languageSelect.className = 'api-docs-language-select';
    portalConfig.supportedLanguages.forEach((language) => {
      const option = document.createElement('option');
      option.value = language.value;
      option.textContent = language.label;
      languageSelect.appendChild(option);
    });

    const status = createText('small', 'api-docs-language-panel-status', '');
    status.setAttribute('aria-live', 'polite');

    control.append(controlLabel, languageSelect, status);
    shell.append(copy, control);
    panel.appendChild(shell);
    hero.after(panel);

    languagePanelElements = {
      acceptLanguage: languageSelect,
      status,
    };

    syncRequestPreferences();
    authorizeAccessToken(readStoredValue(storageKeys.accessToken));

    languageSelect.addEventListener('change', () => {
      writeStoredValue(storageKeys.acceptLanguage, languageSelect.value);
      const selectedLabel = languageSelect.selectedOptions[0]?.textContent || languageSelect.value;
      setLanguageStatus('Requests use ' + selectedLabel + '.');
    });
  };

  const mountAuthorizeRefreshTokenField = () => {
    const modal = document.querySelector('.swagger-ui .dialog-ux .modal-ux');
    const authContainer = modal?.querySelector('.auth-container');

    if (!modal || !authContainer || authContainer.querySelector('.api-docs-authorize-refresh')) {
      return;
    }

    const refreshBlock = document.createElement('div');
    refreshBlock.className = 'api-docs-authorize-refresh';

    const header = document.createElement('div');
    header.className = 'api-docs-authorize-refresh-header';
    header.append(
      createText('span', 'api-docs-authorize-refresh-title', 'Refresh Token'),
      createText(
        'small',
        'api-docs-authorize-refresh-copy',
        'Updated automatically from Register, Login, or Refresh Token responses.',
      ),
    );

    const tokenPreview = document.createElement('div');
    tokenPreview.id = 'api-docs-authorize-refresh-token';
    tokenPreview.className = 'api-docs-authorize-refresh-value';
    tokenPreview.setAttribute('role', 'status');

    refreshBlock.append(header, tokenPreview);
    authContainer.appendChild(refreshBlock);
    syncAuthorizeRefreshTokenField();

    if (!modal.dataset.apiDocsNativeAuthSync) {
      modal.dataset.apiDocsNativeAuthSync = 'true';
      modal.addEventListener(
        'click',
        () => {
          window.setTimeout(syncStoredAccessTokenFromNativeAuthorize, 120);
        },
        true,
      );
    }
  };

  const decorateTopbar = () => {
    const link = document.querySelector('.swagger-ui .topbar .link');

    if (!link || link.querySelector('.api-portal-topbar-brand')) {
      return;
    }

    const brand = document.createElement('span');
    brand.className = 'api-portal-topbar-brand';
    brand.textContent = portalConfig.title;

    const subtitle = document.createElement('small');
    subtitle.textContent = 'OpenAPI docs';
    brand.appendChild(subtitle);

    link.setAttribute('aria-label', portalConfig.title + ' documentation');
    link.appendChild(brand);
  };

  const decorateTags = () => {
    document.querySelectorAll('.swagger-ui .opblock-tag').forEach((tag) => {
      const text = (tag.textContent || '').trim();
      const tagName = tag.dataset.tag || text.split(/\\s+/)[0] || 'API';

      tag.setAttribute('data-tag-initial', tagName.charAt(0).toUpperCase());

    });
  };

  const decorateOperationPaths = () => {
    document.querySelectorAll('.swagger-ui .opblock-tag-section').forEach((section) => {
      const tag = section.querySelector('.opblock-tag');
      const paths = Array.from(section.querySelectorAll('.opblock-summary-path[data-path]'));
      if (!tag || !paths.length) return;

      // Compare complete path segments, never infer a route prefix from a tag name.
      const segments = paths.map((element) =>
        element.getAttribute('data-path').split('/').filter(Boolean),
      );
      const common = segments[0].slice(0, -1);
      while (common.length && !segments.every((parts) =>
        common.every((part, index) => parts[index] === part),
      )) {
        common.pop();
      }
      const prefix = common.length ? '/' + common.join('/') : '';
      let badge = tag.querySelector('.api-docs-tag-base-path');
      if (prefix) {
        if (!badge) {
          badge = document.createElement('code');
          badge.className = 'api-docs-tag-base-path';
          tag.insertBefore(badge, tag.querySelector('.expand-operation'));
        }
        if (badge.textContent !== prefix) badge.textContent = prefix;
      } else {
        badge?.remove();
      }

      paths.forEach((element) => {
        const fullPath = element.getAttribute('data-path');
        const displayPath = fullPath.slice(prefix.length) || '/';
        const target = element.querySelector('a span') || element.querySelector('a') || element;
        if (target.textContent !== displayPath) target.textContent = displayPath;
        element.setAttribute('title', fullPath);
        element.setAttribute('aria-label', fullPath);
      });
    });
  };

  const decorate = () => {
    enforceLightTheme();
    mountHero();
    mountLanguagePanel();
    mountAuthorizeRefreshTokenField();
    decorateTopbar();
    decorateTags();
    decorateOperationPaths();

    prefillRefreshTokenRequestBody();
  };

  decorate();

  const root = document.getElementById('swagger-ui');

  if (root && window.MutationObserver) {
    const observationOptions = { childList: true, subtree: true };
    const observer = new MutationObserver(() => {
      // Our DOM updates must not trigger another decoration pass.
      observer.disconnect();
      try {
        decorate();
      } finally {
        observer.observe(root, observationOptions);
      }
    });
    observer.observe(root, observationOptions);
  }
})();
`.trim();
};
