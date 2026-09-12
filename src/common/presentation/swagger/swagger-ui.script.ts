import { SWAGGER_API_TITLE, SWAGGER_API_VERSION } from './swagger.constants';

const toJavaScriptString = (value: string): string => JSON.stringify(value);

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
  });

  const enforceLightTheme = () => {
    document.documentElement.classList.remove('dark-mode');
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
