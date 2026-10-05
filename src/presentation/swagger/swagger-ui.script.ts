import type { DocsAudience } from './swagger.documents';
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
  'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"%3E%3Crect width="64" height="64" rx="16" fill="%232563eb"/%3E%3Cpath d="M18 46 32 14l14 32h-8l-2.6-6.6H28.6L26 46h-8Zm13-14h2l-1-2.7L31 32Z" fill="white"/%3E%3C/svg%3E';

export const buildSwaggerUiCustomJs = (
  runtimeEnvironment: string,
  audience: DocsAudience = 'user',
): string => {
  const environment = formatEnvironmentName(runtimeEnvironment || 'development');

  return `
(() => {
  const portalConfig = Object.freeze({
    title: ${toJavaScriptString(SWAGGER_API_TITLE)},
    version: ${toJavaScriptString(SWAGGER_API_VERSION)},
    environment: ${toJavaScriptString(environment)},
    authSchemeName: ${toJavaScriptString(SWAGGER_BEARER_AUTH)},
    supportedLanguages: Object.freeze(${toJavaScriptString(SWAGGER_ACCEPTED_LANGUAGES)}),
    audience: ${toJavaScriptString(audience)},
  });

  let activeAudience = portalConfig.audience;
  let navigationVersion = 0;
  let navigationController;

  const preferencePrefix = 'airbnb-clone-api.docs.';
  const getSession = () => activeAudience === 'shared'
    ? (readStoredValue(preferencePrefix + 'shared-session') === 'admin' ? 'admin' : 'user')
    : activeAudience;
  const storageKeys = {
    get accessToken() { return preferencePrefix + getSession() + '.access-token'; },
    get refreshToken() { return preferencePrefix + getSession() + '.refresh-token'; },
    acceptLanguage: preferencePrefix + 'accept-language',
  };

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
    syncSessionStatus();
  };

  const readAuthorizedAccessToken = () => {
    const authorized = window.ui?.getState?.().get('auth')?.get('authorized');
    const scheme = authorized?.get?.(portalConfig.authSchemeName);
    const value = scheme?.get?.('value') || scheme?.value;

    return normalizeToken(value);
  };

  const syncSessionStatus = () => {
    const status = document.querySelector('.api-docs-session-status');
    if (!status) return;
    const authorized = Boolean(readAuthorizedAccessToken());
    const label = getSession() === 'admin' ? 'Admin' : 'User';
    const message = authorized ? label + ' token set' : 'Not authorized';
    if (status.textContent !== message) status.textContent = message;
    status.dataset.state = authorized ? 'authorized' : 'anonymous';
    status.title = authorized ? 'Access token is set. Its validity is checked when you send a request.' : 'Sign in or use Authorize to set an access token.';
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

    if (!path || !setRequestBodyValue) {
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

  const storeTokensFromResponse = (body, context = {}) => {
    if (context.status && (context.status < 200 || context.status >= 300)) return;
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

    // Route credentials to their own session even if the user changes tabs mid-request.
    const path = String(context.url || '').split('?')[0].replace(/\\/$/, '');
    let session = path.endsWith('/auth/admin/login') ? 'admin'
      : path.endsWith('/auth/login') || path.endsWith('/auth/register') ? 'user' : getSession();
    if (path.endsWith('/auth/refresh-token') && accessToken) {
      try {
        const encoded = accessToken.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
        const claims = JSON.parse(window.atob(encoded));
        if (['admin', 'user'].includes(claims.role)) session = claims.role;
      } catch { /* Non-JWT responses keep the selected session. */ }
    }
    const accessKey = preferencePrefix + session + '.access-token';
    const refreshKey = preferencePrefix + session + '.refresh-token';
    writeStoredValue(accessKey, accessToken || readStoredValue(accessKey));
    writeStoredValue(refreshKey, refreshToken || readStoredValue(refreshKey));
    if (getSession() === session) {
      if (accessToken) authorizeAccessToken(accessToken);
      if (refreshToken) syncRefreshTokenRequestBody();
      syncRequestPreferences();
    }
    const input = document.getElementById('api-docs-token-' + session);
    if (input) {
      input.value = readStoredValue(accessKey);
      const card = input.closest('.api-docs-auth-card');
      const state = card?.querySelector('.api-docs-auth-state');
      if (state) state.textContent = 'Captured automatically';
      const refresh = card?.querySelector('.api-docs-auth-refresh');
      if (refresh) refresh.textContent = 'Refresh token: ' + maskToken(readStoredValue(refreshKey));
    }
  };

  window.AirbnbCloneApiDocs = {
    authorizeAccessToken,
    getAcceptedLanguage,
    getRefreshToken: () => readStoredValue(storageKeys.refreshToken),
    syncRequestPreferences,
    storeTokensFromResponse,
  };

  const createText = (tagName, className, text) => {
    const element = document.createElement(tagName);
    element.className = className;
    element.textContent = text;
    return element;
  };

  const mountHero = () => {
    const root = document.getElementById('swagger-ui');
    const topbar = root?.querySelector('.topbar');
    if (!root || !topbar || document.querySelector('.api-portal-hero')) return;
    const hero = document.createElement('header');
    hero.className = 'api-portal-hero';
    hero.append(
      createText('span', 'api-portal-brand', portalConfig.title),
      createText('span', 'api-portal-meta', 'v' + portalConfig.version + ' | ' + portalConfig.environment),
    );
    const tabs = document.createElement('nav');
    tabs.className = 'api-portal-tabs';
    tabs.setAttribute('aria-label', 'API audience');
    const base = window.location.pathname.replace(/\\/(?:user|admin|shared)\\/?$/, '').replace(/\\/$/, '');
    ['user', 'admin', 'shared'].forEach((audience) => {
      const link = createText('a', 'api-portal-tab', audience[0].toUpperCase() + audience.slice(1));
      link.href = base + '/' + audience;
      if (audience === activeAudience) link.setAttribute('aria-current', 'page');
      link.addEventListener('click', (event) => {
        if (event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
        event.preventDefault();
        navigateAudience(audience, link.href, true);
      });
      tabs.appendChild(link);
    });
    hero.appendChild(tabs);
    topbar.after(hero);
    const sidebar = document.createElement('aside');
    sidebar.className = 'api-docs-sidebar';
    sidebar.setAttribute('aria-label', 'Resources');
    sidebar.appendChild(createText('p', 'api-docs-sidebar-title', 'RESOURCES'));
    const nav = document.createElement('nav');
    sidebar.appendChild(nav);
    hero.after(sidebar);
  };

  const mountLanguagePanel = () => {
    const toolbar = document.querySelector('.swagger-ui .scheme-container .schemes');
    if (!toolbar || document.querySelector('.api-docs-language-panel')) return;
    const panel = document.createElement('div');
    panel.className = 'api-docs-language-panel';
    const label = createText('label', '', 'Language');
    const select = document.createElement('select');
    select.id = 'api-docs-accept-language';
    portalConfig.supportedLanguages.forEach((language) => {
      const option = createText('option', '', language.label);
      option.value = language.value;
      select.appendChild(option);
    });
    label.appendChild(select);
    const status = createText('small', 'api-docs-language-panel-status', '');
    status.setAttribute('aria-live', 'polite');
    panel.append(label, status);
    languagePanelElements = { acceptLanguage: select, status };
    select.addEventListener('change', () => {
      writeStoredValue(storageKeys.acceptLanguage, select.value);
      syncRequestPreferences();
    });
    if (activeAudience === 'shared') {
      const sessionLabel = createText('label', '', 'Session');
      const sessionSelect = document.createElement('select');
      ['user', 'admin'].forEach((session) => {
        const option = createText('option', '', session === 'admin' ? 'Admin' : 'User');
        option.value = session;
        sessionSelect.appendChild(option);
      });
      sessionSelect.value = getSession();
      sessionSelect.addEventListener('change', () => {
        writeStoredValue(preferencePrefix + 'shared-session', sessionSelect.value);
        authorizeAccessToken(readStoredValue(storageKeys.accessToken));
        syncRefreshTokenRequestBody();
        syncRequestPreferences();
      });
      sessionLabel.appendChild(sessionSelect);
      panel.appendChild(sessionLabel);
    }
    const clear = createText('button', 'api-docs-clear-session', 'Clear session');
    clear.type = 'button';
    clear.addEventListener('click', () => {
      writeStoredValue(storageKeys.accessToken, '');
      writeStoredValue(storageKeys.refreshToken, '');
      authorizeAccessToken('');
      const path = findRefreshTokenPath();
      if (path) window.ui?.oas3Actions?.setRequestBodyValue?.({ value: JSON.stringify({ token: '' }, null, 2), pathMethod: [path, 'post'] });
      syncRequestPreferences();
    });
    const sessionStatus = createText('span', 'api-docs-session-status', 'Not authorized');
    sessionStatus.setAttribute('role', 'status');
    sessionStatus.setAttribute('aria-live', 'polite');
    panel.append(sessionStatus, clear);
    toolbar.appendChild(panel);
    syncRequestPreferences();
    authorizeAccessToken(readStoredValue(storageKeys.accessToken));
    syncSessionStatus();
  };

  const mountAuthorizeRefreshTokenField = () => {
    const modal = document.querySelector('.swagger-ui .dialog-ux .modal-ux');
    const content = modal?.querySelector('.modal-ux-content');
    if (!content || content.querySelector('.api-docs-dual-auth')) return;
    modal.classList.add('api-docs-dual-auth-ready');
    const panel = document.createElement('section');
    panel.className = 'api-docs-dual-auth';
    panel.setAttribute('aria-label', 'Admin and user authorization');
    const current = getSession() === 'admin' ? 'Admin' : 'User';
    panel.appendChild(createText('p', 'api-docs-auth-context', 'Sign in using Execute: access and refresh tokens are captured automatically. Current requests use the ' + current + ' session. Manual entry below is optional.'));
    ['admin', 'user'].forEach((session) => {
      const name = session === 'admin' ? 'Admin' : 'User';
      const accessKey = preferencePrefix + session + '.access-token';
      const refreshKey = preferencePrefix + session + '.refresh-token';
      const card = document.createElement('form');
      card.className = 'api-docs-auth-card';
      const heading = createText('div', 'api-docs-auth-card-heading', name + ' session');
      if (session === getSession()) heading.appendChild(createText('span', 'api-docs-auth-active', 'Active'));
      const label = createText('label', 'api-docs-auth-label', name + ' access token');
      label.htmlFor = 'api-docs-token-' + session;
      const input = document.createElement('input');
      input.id = label.htmlFor;
      input.type = 'password';
      input.autocomplete = 'off';
      input.spellcheck = false;
      input.placeholder = 'Filled automatically after ' + session + ' login';
      input.value = readStoredValue(accessKey);
      const field = document.createElement('div');
      field.className = 'api-docs-auth-field';
      const reveal = createText('button', 'api-docs-auth-reveal', 'Show');
      reveal.type = 'button';
      reveal.setAttribute('aria-label', 'Show ' + session + ' token');
      reveal.setAttribute('aria-pressed', 'false');
      reveal.addEventListener('click', () => {
        const visible = input.type === 'password';
        input.type = visible ? 'text' : 'password';
        reveal.textContent = visible ? 'Hide' : 'Show';
        reveal.setAttribute('aria-label', (visible ? 'Hide ' : 'Show ') + session + ' token');
        reveal.setAttribute('aria-pressed', String(visible));
      });
      field.append(input, reveal);
      const actions = document.createElement('div');
      actions.className = 'api-docs-auth-actions';
      const save = createText('button', 'btn execute', 'Save ' + name + ' token');
      save.type = 'submit';
      const clear = createText('button', 'btn', 'Clear ' + name);
      clear.type = 'button';
      const state = createText('span', 'api-docs-auth-state', readStoredValue(accessKey) ? 'Token saved' : 'No token saved');
      state.setAttribute('role', 'status');
      const refresh = createText('small', 'api-docs-auth-refresh', 'Refresh token: ' + maskToken(readStoredValue(refreshKey)));
      const apply = () => {
        if (getSession() === session) {
          authorizeAccessToken(readStoredValue(accessKey));
          syncRefreshTokenRequestBody();
          syncRequestPreferences();
        }
        refresh.textContent = 'Refresh token: ' + maskToken(readStoredValue(refreshKey));
      };
      card.addEventListener('submit', (event) => {
        event.preventDefault();
        const token = normalizeToken(input.value);
        if (!token) {
          state.textContent = 'Enter an access token first.';
          input.focus();
          return;
        }
        if (token !== readStoredValue(accessKey)) writeStoredValue(refreshKey, '');
        writeStoredValue(accessKey, token);
        input.value = token;
        state.textContent = 'Token saved';
        apply();
      });
      clear.addEventListener('click', () => {
        writeStoredValue(accessKey, '');
        writeStoredValue(refreshKey, '');
        input.value = '';
        state.textContent = 'Session cleared';
        apply();
      });
      actions.append(save, clear, state);
      card.append(heading, label, field, actions, refresh);
      panel.appendChild(card);
    });
    content.appendChild(panel);
  };

  const decorateResources = () => {
    const spec = window.ui?.specSelectors?.specJson?.()?.toJS?.();
    document.querySelectorAll('.swagger-ui .opblock').forEach((block) => {
      const path = block.querySelector('.opblock-summary-path')?.getAttribute('data-path');
      const method = block.querySelector('.opblock-summary-method')?.textContent?.toLowerCase();
      const operation = spec?.paths?.[path]?.[method];
      const summary = block.querySelector('.opblock-summary');
      if (!operation || !summary || summary.querySelector('.api-docs-access')) return;
      const badge = createText('span', 'api-docs-access', operation['x-docs-access'] || 'Authenticated');
      badge.dataset.access = operation['x-docs-public'] ? 'public' : 'protected';
      summary.appendChild(badge);
    });
    const filter = document.querySelector('.swagger-ui .operation-filter-input');
    if (filter) {
      filter.placeholder = 'Search endpoints by name, path, or method...';
      filter.setAttribute('aria-label', 'Search API operations');
    }
    const nav = document.querySelector('.api-docs-sidebar nav');
    if (!nav || !spec) return;
    const sections = Array.from(document.querySelectorAll('.swagger-ui .opblock-tag-section'));
    const entries = sections.map((section) => {
      const header = section.querySelector('.opblock-tag');
      const name = header?.getAttribute('data-tag') || header?.querySelector('a')?.textContent || 'API';
      const query = (filter?.value || '').toLowerCase();
      const operations = [];
      Object.entries(spec.paths || {}).forEach(([path, item]) => {
        ['get', 'post', 'put', 'patch', 'delete', 'options', 'head', 'trace'].forEach((method) => {
          const operation = item[method];
          if (!operation?.tags?.includes(name)) return;
          if (![name, path, method, operation.summary, operation.operationId].some((value) => String(value || '').toLowerCase().includes(query))) return;
          operations.push({ path, method, operation });
        });
      });
      operations.sort((left, right) => (left.operation['x-docs-order'] || 1000) - (right.operation['x-docs-order'] || 1000));
      return { section, header, name, operations };
    });
    const signature = JSON.stringify(entries.map(({ name, operations }) => [name, operations.map(({ path, method }) => method + path)]));
    if (nav.dataset.signature !== signature) {
      nav.dataset.signature = signature;
      nav.replaceChildren();
      entries.forEach(({ section, header, name, operations }) => {
        if (!header) return;
        const group = document.createElement('div');
        group.className = 'api-docs-nav-group';
        const link = createText('a', 'api-docs-resource-link', name);
        link.href = '#' + header.id;
        link.appendChild(createText('span', 'api-docs-resource-count', String(operations.length)));
        link.addEventListener('click', (event) => {
          event.preventDefault();
          if (!section.classList.contains('is-open')) header.click();
          header.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
        group.appendChild(link);
        operations.forEach(({ path, method, operation }) => {
          const target = createText('button', 'api-docs-operation-link', '');
          target.type = 'button';
          target.dataset.path = path;
          target.dataset.method = method;
          target.title = method.toUpperCase() + ' ' + path;
          target.append(
            createText('span', 'api-docs-nav-method api-docs-method-' + method, method.toUpperCase()),
            createText('span', 'api-docs-nav-summary', operation.summary || path),
          );
          target.addEventListener('click', () => {
            if (!section.classList.contains('is-open')) header.click();
            window.requestAnimationFrame(() => {
              const block = Array.from(section.querySelectorAll('.opblock')).find((element) =>
                element.querySelector('.opblock-summary-path')?.getAttribute('data-path') === path &&
                element.querySelector('.opblock-summary-method')?.textContent?.toLowerCase() === method,
              );
              if (!block) return;
              if (!block.classList.contains('is-open')) block.querySelector('.opblock-summary-control')?.click();
              block.scrollIntoView({ behavior: 'smooth', block: 'start' });
              nav.querySelectorAll('[aria-current]').forEach((element) => element.removeAttribute('aria-current'));
              target.setAttribute('aria-current', 'location');
            });
          });
          group.appendChild(target);
        });
        nav.appendChild(group);
      });
    }
    const info = document.querySelector('.swagger-ui .info');
    if (info && !info.querySelector('.api-docs-overview')) {
      const total = Object.values(spec.paths || {}).reduce((count, item) => count + Object.keys(item).filter((method) => ['get','post','put','patch','delete','options','head','trace'].includes(method)).length, 0);
      const overview = createText('div', 'api-docs-overview', 'API REFERENCE');
      overview.appendChild(createText('span', '', total + ' endpoints / ' + (spec.tags?.length || 0) + (spec.tags?.length === 1 ? ' resource' : ' resources')));
      info.prepend(overview);
    }
    entries.forEach(({ header, operations }) => {
      if (!header) return;
      let count = header.querySelector('.api-docs-tag-count');
      if (!count) {
        count = createText('span', 'api-docs-tag-count', '');
        header.insertBefore(count, header.querySelector('.expand-operation'));
      }
      const label = operations.length + (operations.length === 1 ? ' endpoint' : ' endpoints');
      if (count.textContent !== label) count.textContent = label;
    });
  };

  const selectWidgets = new WeakMap();
  const closeDropdowns = (except) => {
    document.querySelectorAll('.api-docs-dropdown').forEach((widget) => {
      if (widget === except) return;
      widget.querySelector('[role="listbox"]').hidden = true;
      widget.querySelector('[role="combobox"]').setAttribute('aria-expanded', 'false');
    });
  };
  document.addEventListener?.('click', (event) => {
    if (!event.target.closest?.('.api-docs-dropdown')) closeDropdowns();
  });

  const enhanceRequestControls = () => {
    const container = document.querySelector('.swagger-ui .scheme-container');
    if (!container) return;
    if (!container.querySelector('.api-docs-toolbar-heading')) {
      const heading = createText('div', 'api-docs-toolbar-heading', 'Request settings');
      heading.appendChild(createText('span', '', 'Environment, language & authorization'));
      container.prepend(heading);
    }
    container.querySelectorAll('select').forEach((select, index) => {
      let widget = selectWidgets.get(select);
      if (!widget || !widget.isConnected) {
        widget = document.createElement('div');
        widget.className = 'api-docs-dropdown';
        const trigger = createText('button', 'api-docs-dropdown-trigger', '');
        trigger.type = 'button';
        trigger.setAttribute('role', 'combobox');
        trigger.setAttribute('aria-haspopup', 'listbox');
        trigger.setAttribute('aria-expanded', 'false');
        trigger.setAttribute('aria-label', select.id === 'servers' ? 'Server' : select.id === 'api-docs-accept-language' ? 'Language' : 'Session');
        const list = document.createElement('div');
        list.className = 'api-docs-dropdown-menu';
        list.setAttribute('role', 'listbox');
        list.id = 'api-docs-options-' + index;
        list.hidden = true;
        trigger.setAttribute('aria-controls', list.id);
        const open = () => {
          closeDropdowns(widget);
          list.hidden = false;
          trigger.setAttribute('aria-expanded', 'true');
          const options = Array.from(list.querySelectorAll('[role="option"]'));
          (options.find((option) => option.getAttribute('aria-selected') === 'true') || options[0])?.focus();
        };
        trigger.addEventListener('click', (event) => {
          event.preventDefault();
          if (list.hidden) open();
          else { closeDropdowns(); trigger.focus(); }
        });
        trigger.addEventListener('keydown', (event) => {
          if (['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) { event.preventDefault(); open(); }
          if (event.key === 'Escape') closeDropdowns();
        });
        list.addEventListener('keydown', (event) => {
          const options = Array.from(list.querySelectorAll('[role="option"]'));
          const current = options.indexOf(document.activeElement);
          let next;
          if (event.key === 'ArrowDown') next = (current + 1) % options.length;
          if (event.key === 'ArrowUp') next = (current - 1 + options.length) % options.length;
          if (event.key === 'Home') next = 0;
          if (event.key === 'End') next = options.length - 1;
          if (next !== undefined) { event.preventDefault(); options[next]?.focus(); }
          if (event.key === 'Escape') { event.preventDefault(); closeDropdowns(); trigger.focus(); }
          if (event.key === 'Tab') closeDropdowns();
        });
        widget.append(trigger, list);
        select.classList.add('api-docs-native-select');
        select.setAttribute('aria-hidden', 'true');
        select.tabIndex = -1;
        select.after(widget);
        selectWidgets.set(select, widget);
      }
      const trigger = widget.querySelector('[role="combobox"]');
      const list = widget.querySelector('[role="listbox"]');
      const label = select.selectedOptions[0]?.textContent || 'Select';
      if (trigger.textContent !== label) trigger.textContent = label;
      const signature = JSON.stringify(Array.from(select.options).map((option) => [option.value, option.textContent, option.disabled]));
      if (list.dataset.signature !== signature) {
        list.dataset.signature = signature;
        list.replaceChildren();
        Array.from(select.options).forEach((option) => {
          const item = createText('button', 'api-docs-dropdown-option', option.textContent);
          item.type = 'button';
          item.setAttribute('role', 'option');
          item.dataset.value = option.value;
          item.disabled = option.disabled;
          item.addEventListener('click', (event) => {
            event.preventDefault();
            select.value = option.value;
            select.dispatchEvent(new Event('change', { bubbles: true }));
            trigger.textContent = option.textContent;
            list.querySelectorAll('[role="option"]').forEach((candidate) => candidate.setAttribute('aria-selected', String(candidate.dataset.value === select.value)));
            closeDropdowns();
            trigger.focus();
          });
          list.appendChild(item);
        });
      }
      list.querySelectorAll('[role="option"]').forEach((option) => option.setAttribute('aria-selected', String(option.dataset.value === select.value)));
    });
  };

  let lastSelectedOperation = '';
  const syncActiveOperation = () => {
    const blocks = Array.from(document.querySelectorAll('.swagger-ui .opblock'));
    const open = blocks.filter((block) => block.classList.contains('is-open'));
    const visible = blocks.filter((block) => {
      const rectangle = block.getBoundingClientRect();
      return rectangle.top >= 70 && rectangle.top < window.innerHeight * 0.65;
    });
    const block = visible.find((candidate) => open.includes(candidate)) || visible[0] || open[0];
    const path = block?.querySelector('.opblock-summary-path')?.getAttribute('data-path');
    const method = block?.querySelector('.opblock-summary-method')?.textContent?.toLowerCase();
    const selected = method + ':' + path;
    if (selected === lastSelectedOperation && document.querySelector('.api-docs-operation-link[aria-current]')) return;
    lastSelectedOperation = selected;
    document.querySelectorAll('.api-docs-operation-link').forEach((link) => {
      const active = link.dataset.path === path && link.dataset.method === method;
      if (active) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    });
  };

  let scrollScheduled = false;
  window.addEventListener?.('scroll', () => {
    if (scrollScheduled) return;
    scrollScheduled = true;
    window.requestAnimationFrame(() => {
      scrollScheduled = false;
      syncActiveOperation();
    });
  }, { passive: true });

  const navigateAudience = async (audience, href, pushHistory) => {
    if (!['user', 'admin', 'shared'].includes(audience)) return;
    const version = ++navigationVersion;
    navigationController?.abort();
    if (audience === activeAudience) {
      document.getElementById('swagger-ui')?.removeAttribute('aria-busy');
      document.querySelector('.api-docs-navigation-status')?.remove();
      return;
    }
    const root = document.getElementById('swagger-ui');
    const hero = document.querySelector('.api-portal-hero');
    let status = hero?.querySelector('.api-docs-navigation-status');
    if (!status && hero) {
      status = createText('span', 'api-docs-navigation-status', '');
      status.setAttribute('role', 'status');
      hero.appendChild(status);
    }
    if (status) status.textContent = 'Loading ' + audience + ' APIs...';
    root?.setAttribute('aria-busy', 'true');
    navigationController = new AbortController();
    const url = new URL(href, window.location.href);
    const documentUrl = url.pathname.replace(/\\/$/, '') + '-json';
    try {
      const response = await fetch(documentUrl, { signal: navigationController.signal });
      if (!response.ok) throw new Error('Documentation unavailable');
      const spec = await response.json();
      if (!spec.paths || !spec.openapi) throw new Error('Invalid API document');
      if (version !== navigationVersion) return;
      closeDropdowns();
      document.querySelector('.modal-ux .close-modal')?.click();
      activeAudience = audience;
      document.querySelector('.api-docs-language-panel')?.remove();
      languagePanelElements = null;
      window.ui.layoutActions.updateFilter('');
      window.ui.specActions.updateUrl(documentUrl);
      window.ui.specActions.updateSpec(JSON.stringify(spec));
      document.querySelector('.api-docs-overview')?.remove();
      document.querySelector('.api-docs-sidebar nav')?.removeAttribute('data-signature');
      document.querySelectorAll('.api-portal-tab').forEach((tab) => {
        if (new URL(tab.href).pathname.replace(/\\/$/, '') === url.pathname.replace(/\\/$/, '')) tab.setAttribute('aria-current', 'page');
        else tab.removeAttribute('aria-current');
      });
      authorizeAccessToken(readStoredValue(storageKeys.accessToken));
      if (pushHistory) window.history.pushState({ audience }, '', url.pathname);
      document.title = portalConfig.title + ' | ' + audience[0].toUpperCase() + audience.slice(1);
      window.scrollTo({ top: 0, behavior: 'instant' });
      status?.remove();
    } catch (error) {
      if (version !== navigationVersion || error.name === 'AbortError') return;
      if (status) status.textContent = 'Could not load this section. Please try again.';
      if (!pushHistory) {
        const active = document.querySelector('.api-portal-tab[aria-current="page"]');
        if (active) window.history.replaceState({ audience: activeAudience }, '', active.href);
      }
    } finally {
      if (version === navigationVersion) root?.removeAttribute('aria-busy');
    }
  };

  window.addEventListener?.('popstate', () => {
    const audience = window.location.pathname.split('/').filter(Boolean).pop();
    navigateAudience(audience, window.location.href, false);
  });

  const decorate = () => {
    enforceLightTheme();
    mountHero();
    mountLanguagePanel();
    mountAuthorizeRefreshTokenField();
    decorateResources();
    syncSessionStatus();
    enhanceRequestControls();
    syncActiveOperation();

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
