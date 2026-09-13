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

  let contextPanelElements = null;

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

  const setContextStatus = (message) => {
    if (contextPanelElements?.status) {
      contextPanelElements.status.textContent = message;
    }
  };

  const syncContextPanel = () => {
    if (!contextPanelElements) {
      return;
    }

    contextPanelElements.accessToken.value = readStoredValue(storageKeys.accessToken);
    contextPanelElements.refreshToken.value = readStoredValue(storageKeys.refreshToken);
    contextPanelElements.acceptLanguage.value = getAcceptedLanguage();
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

    syncContextPanel();
    setContextStatus('Tokens captured from the latest authentication response.');
  };

  window.AirbnbCloneApiDocs = {
    authorizeAccessToken,
    getAcceptedLanguage,
    storeTokensFromResponse,
    syncContextPanel,
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

  const createContextField = (label, control, hint) => {
    const field = document.createElement('label');
    field.className = 'api-docs-context-field';

    const labelText = document.createElement('span');
    labelText.textContent = label;

    const hintText = document.createElement('small');
    hintText.textContent = hint;

    field.append(labelText, control, hintText);
    return field;
  };

  const createTokenInput = (id, placeholder) => {
    const input = document.createElement('textarea');
    input.id = id;
    input.className = 'api-docs-token-input';
    input.autocomplete = 'off';
    input.rows = 2;
    input.spellcheck = false;
    input.placeholder = placeholder;
    return input;
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

  const mountContextPanel = () => {
    const hero = document.querySelector('.api-portal-hero');

    if (!hero || document.querySelector('.api-docs-context')) {
      return;
    }

    const panel = document.createElement('section');
    panel.className = 'api-docs-context';
    panel.setAttribute('aria-label', 'Authentication context and request preferences');

    const shell = document.createElement('div');
    shell.className = 'api-docs-context-shell';

    const header = document.createElement('div');
    header.className = 'api-docs-context-header';

    const headerCopy = document.createElement('div');
    headerCopy.append(
      createText('p', 'api-docs-context-kicker', 'Request context'),
      createText('h2', 'api-docs-context-title', 'Authentication Context'),
      createText(
        'p',
        'api-docs-context-summary',
        'Store tokens returned by Register, Login, or Refresh Token. The access token is applied to Swagger Bearer auth.',
      ),
    );

    const status = createText('p', 'api-docs-context-status', 'Ready for authentication testing.');
    status.setAttribute('aria-live', 'polite');
    header.append(headerCopy, status);

    const accessTokenInput = createTokenInput(
      'api-docs-access-token',
      'Paste access token without the Bearer prefix',
    );
    const refreshTokenInput = createTokenInput('api-docs-refresh-token', 'Paste refresh token');

    const languageSelect = document.createElement('select');
    languageSelect.id = 'api-docs-accept-language';
    languageSelect.className = 'api-docs-language-select';
    portalConfig.supportedLanguages.forEach((language) => {
      const option = document.createElement('option');
      option.value = language.value;
      option.textContent = language.label;
      languageSelect.appendChild(option);
    });

    const fields = document.createElement('div');
    fields.className = 'api-docs-context-fields';
    fields.append(
      createContextField('Access Token', accessTokenInput, 'Used by native Bearer authorization.'),
      createContextField('Refresh Token', refreshTokenInput, 'Kept for the refresh-token request flow.'),
      createContextField('Accepted Language', languageSelect, 'Sent as the Accept-Language header.'),
    );

    const actions = document.createElement('div');
    actions.className = 'api-docs-context-actions';

    const applyButton = document.createElement('button');
    applyButton.type = 'button';
    applyButton.className = 'api-docs-context-button api-docs-context-button-primary';
    applyButton.textContent = 'Apply token';

    const clearButton = document.createElement('button');
    clearButton.type = 'button';
    clearButton.className = 'api-docs-context-button';
    clearButton.textContent = 'Clear';

    actions.append(applyButton, clearButton);
    shell.append(header, fields, actions);
    panel.appendChild(shell);
    hero.after(panel);

    contextPanelElements = {
      accessToken: accessTokenInput,
      acceptLanguage: languageSelect,
      refreshToken: refreshTokenInput,
      status,
    };

    syncContextPanel();
    authorizeAccessToken(accessTokenInput.value);

    accessTokenInput.addEventListener('input', () => {
      const token = normalizeToken(accessTokenInput.value);
      writeStoredValue(storageKeys.accessToken, token);
      authorizeAccessToken(token);
      setContextStatus(token ? 'Access token applied to Bearer auth.' : 'Access token cleared.');
    });

    refreshTokenInput.addEventListener('input', () => {
      const token = normalizeToken(refreshTokenInput.value);
      writeStoredValue(storageKeys.refreshToken, token);
      setContextStatus(token ? 'Refresh token stored in this browser.' : 'Refresh token cleared.');
    });

    languageSelect.addEventListener('change', () => {
      writeStoredValue(storageKeys.acceptLanguage, languageSelect.value);
      const selectedLabel = languageSelect.selectedOptions[0]?.textContent || languageSelect.value;
      setContextStatus('Requests will use ' + selectedLabel + '.');
    });

    applyButton.addEventListener('click', () => {
      const token = normalizeToken(accessTokenInput.value);
      writeStoredValue(storageKeys.accessToken, token);
      authorizeAccessToken(token);
      setContextStatus(token ? 'Access token applied to Bearer auth.' : 'Add an access token first.');
    });

    clearButton.addEventListener('click', () => {
      writeStoredValue(storageKeys.accessToken, '');
      writeStoredValue(storageKeys.refreshToken, '');
      accessTokenInput.value = '';
      refreshTokenInput.value = '';
      authorizeAccessToken('');
      setContextStatus('Authentication context cleared.');
    });
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
      const tagName = text.split(/\\s+/)[0] || 'API';
      tag.setAttribute('data-tag-initial', tagName.charAt(0).toUpperCase());
    });
  };

  const decorate = () => {
    enforceLightTheme();
    mountHero();
    mountContextPanel();
    decorateTopbar();
    decorateTags();
  };

  decorate();

  const root = document.getElementById('swagger-ui');

  if (root && window.MutationObserver) {
    const observer = new MutationObserver(decorate);
    observer.observe(root, { childList: true, subtree: true });
  }
})();
`.trim();
};
