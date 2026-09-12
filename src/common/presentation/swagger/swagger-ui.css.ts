export const SWAGGER_UI_CUSTOM_CSS = `
/* ==========================================================================
   1. Design tokens
   ========================================================================== */
:root {
  color-scheme: light;

  --docs-accent: #ff385c;
  --docs-accent-strong: #d91d48;
  --docs-accent-soft: #fff1f4;
  --docs-accent-ring: rgba(255, 56, 92, 0.24);

  --docs-ink: #111827;
  --docs-text: #334155;
  --docs-muted: #64748b;
  --docs-faint: #94a3b8;

  --docs-bg: #f6f8fb;
  --docs-surface: #ffffff;
  --docs-surface-raised: #ffffff;
  --docs-surface-subtle: #f8fafc;
  --docs-surface-warm: #fff7f8;

  --docs-border: #dfe5ee;
  --docs-border-strong: #cbd5e1;
  --docs-divider: rgba(148, 163, 184, 0.22);

  --docs-success: #067647;
  --docs-success-soft: #ecfdf3;
  --docs-info: #2563eb;
  --docs-info-soft: #eff6ff;
  --docs-warning: #b54708;
  --docs-warning-soft: #fffaeb;
  --docs-danger: #d92d20;
  --docs-danger-soft: #fef3f2;
  --docs-teal: #0f766e;
  --docs-teal-soft: #f0fdfa;

  --docs-code-bg: #111827;
  --docs-code-border: #263244;
  --docs-code-text: #e5e7eb;

  --docs-radius-xs: 6px;
  --docs-radius-sm: 8px;
  --docs-radius-md: 10px;
  --docs-radius-lg: 12px;

  --docs-shadow-sm: 0 1px 2px rgba(16, 24, 40, 0.06);
  --docs-shadow-md: 0 12px 30px rgba(15, 23, 42, 0.08);
  --docs-shadow-lg: 0 22px 55px rgba(15, 23, 42, 0.11);

  --docs-font-sans:
    Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI",
    sans-serif;
  --docs-font-mono:
    "JetBrains Mono", "SFMono-Regular", Consolas, "Liberation Mono", Menlo,
    monospace;
  --docs-page-max: 1120px;
  --docs-ease: cubic-bezier(0.16, 1, 0.3, 1);
}

html,
html.dark-mode {
  background: var(--docs-bg);
  color-scheme: light;
}

body {
  min-height: 100vh;
  overflow-x: hidden;
  background:
    radial-gradient(circle at 12% -10%, rgba(255, 56, 92, 0.13), transparent 28rem),
    radial-gradient(circle at 92% 6%, rgba(15, 118, 110, 0.1), transparent 26rem),
    linear-gradient(180deg, #ffffff 0, #f6f8fb 26rem, #f6f8fb 100%);
  color: var(--docs-text);
  font-family: var(--docs-font-sans);
  text-rendering: optimizeLegibility;
  -webkit-font-smoothing: antialiased;
}

body::before {
  position: fixed;
  inset: 0;
  z-index: -1;
  pointer-events: none;
  content: "";
  background-image:
    linear-gradient(rgba(148, 163, 184, 0.08) 1px, transparent 1px),
    linear-gradient(90deg, rgba(148, 163, 184, 0.08) 1px, transparent 1px);
  background-size: 56px 56px;
  mask-image: linear-gradient(180deg, rgba(0, 0, 0, 0.7), transparent 36rem);
}

/* ==========================================================================
   2. Global Swagger overrides
   ========================================================================== */
.swagger-ui {
  color: var(--docs-text);
  font-family: var(--docs-font-sans);
}

.swagger-ui *,
.swagger-ui *::before,
.swagger-ui *::after {
  box-sizing: border-box;
}

.swagger-ui .wrapper,
.swagger-ui .information-container.wrapper,
.swagger-ui .scheme-container .wrapper,
.swagger-ui .opblock-tag-section,
.swagger-ui .models {
  width: min(100% - 48px, var(--docs-page-max));
  max-width: var(--docs-page-max);
  margin-right: auto;
  margin-left: auto;
  padding-right: 0;
  padding-left: 0;
}

.swagger-ui a,
.swagger-ui .link {
  color: var(--docs-info);
  text-decoration-thickness: 1px;
  text-underline-offset: 3px;
}

.swagger-ui p,
.swagger-ui li,
.swagger-ui table,
.swagger-ui label,
.swagger-ui .renderedMarkdown,
.swagger-ui .markdown p {
  color: var(--docs-text);
  font-size: 14px;
  line-height: 1.7;
}

.swagger-ui h1,
.swagger-ui h2,
.swagger-ui h3,
.swagger-ui h4,
.swagger-ui h5,
.swagger-ui .title,
.swagger-ui .opblock-tag,
.swagger-ui .opblock-summary-path,
.swagger-ui .model-title {
  color: var(--docs-ink);
  font-family: var(--docs-font-sans);
  letter-spacing: 0;
}

.swagger-ui small,
.swagger-ui .markdown code,
.swagger-ui .prop-type,
.swagger-ui .prop-format,
.swagger-ui .parameter__type,
.swagger-ui .parameter__in {
  font-family: var(--docs-font-mono);
}

.swagger-ui .main {
  padding-bottom: 72px;
}

.swagger-ui .no-margin {
  margin: 0;
}

.swagger-ui .clearfix::after {
  display: table;
  clear: both;
  content: "";
}

/* ==========================================================================
   3. Topbar
   ========================================================================== */
.swagger-ui .topbar {
  position: sticky;
  top: 0;
  z-index: 70;
  min-height: 68px;
  padding: 0;
  background: rgba(255, 255, 255, 0.88);
  border-bottom: 1px solid rgba(203, 213, 225, 0.72);
  box-shadow: 0 10px 28px rgba(15, 23, 42, 0.07);
  backdrop-filter: blur(18px);
}

.swagger-ui .topbar .topbar-wrapper {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: min(100% - 48px, var(--docs-page-max));
  max-width: var(--docs-page-max);
  min-height: 68px;
  padding: 0;
  margin: 0 auto;
  gap: 18px;
}

.swagger-ui .topbar .link {
  display: inline-flex;
  align-items: center;
  min-width: 0;
  gap: 12px;
  max-width: none;
  text-decoration: none;
}

.swagger-ui .topbar .link img,
.swagger-ui .topbar .link svg,
.swagger-ui .topbar .link > span:not(.api-portal-topbar-brand) {
  display: none;
}

.swagger-ui .topbar .link::before {
  display: grid;
  width: 36px;
  height: 36px;
  flex: 0 0 auto;
  place-items: center;
  color: #ffffff;
  font-size: 16px;
  font-weight: 800;
  content: "A";
  background:
    linear-gradient(135deg, rgba(255, 255, 255, 0.24), transparent 45%),
    linear-gradient(135deg, var(--docs-accent), #ec4899);
  border-radius: var(--docs-radius-sm);
  box-shadow: 0 12px 24px rgba(255, 56, 92, 0.25);
}

.api-portal-topbar-brand {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
  color: var(--docs-ink);
  font-size: 14px;
  font-weight: 800;
  line-height: 1.15;
}

.api-portal-topbar-brand small {
  color: var(--docs-muted);
  font-size: 11px;
  font-weight: 650;
  letter-spacing: 0;
}

.swagger-ui .topbar .download-url-wrapper {
  display: none;
}

.swagger-ui .topbar .scheme-container,
.swagger-ui .topbar .authorization__btn,
.swagger-ui .topbar .servers {
  margin-left: auto;
}

.swagger-ui .topbar .mode-switch,
.swagger-ui .topbar .dark-mode-toggle,
.swagger-ui .topbar [class*="dark-mode"] {
  display: none;
}

/* ==========================================================================
   4. API information and portal hero
   ========================================================================== */
.api-portal-hero {
  width: min(100% - 48px, var(--docs-page-max));
  max-width: var(--docs-page-max);
  margin: 28px auto 24px;
  animation: docsFadeUp 360ms var(--docs-ease) both;
}

.api-portal-shell {
  position: relative;
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(300px, 360px);
  gap: 30px;
  overflow: hidden;
  padding: 34px;
  background:
    linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(255, 247, 248, 0.92) 55%, rgba(240, 253, 250, 0.94) 100%);
  border: 1px solid rgba(203, 213, 225, 0.82);
  border-radius: var(--docs-radius-lg);
  box-shadow: var(--docs-shadow-lg);
}

.api-portal-shell::before {
  position: absolute;
  top: 0;
  right: 0;
  left: 0;
  height: 4px;
  content: "";
  background: linear-gradient(90deg, var(--docs-accent), #fb7185 38%, var(--docs-teal));
}

.api-portal-copy {
  position: relative;
  z-index: 1;
  min-width: 0;
}

.api-portal-kicker {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  margin: 0 0 14px;
  color: var(--docs-accent-strong);
  font-size: 12px;
  font-weight: 850;
  letter-spacing: 0.08em;
  line-height: 1;
  text-transform: uppercase;
}

.api-portal-kicker::before {
  width: 8px;
  height: 8px;
  content: "";
  background: var(--docs-accent);
  border-radius: 999px;
  box-shadow: 0 0 0 5px rgba(255, 56, 92, 0.12);
}

.api-portal-title {
  max-width: 720px;
  margin: 0;
  color: var(--docs-ink);
  font-size: clamp(42px, 6vw, 72px);
  font-weight: 850;
  line-height: 0.98;
  letter-spacing: 0;
}

.api-portal-summary {
  max-width: 660px;
  margin: 18px 0 0;
  color: var(--docs-text);
  font-size: 16px;
  line-height: 1.75;
}

.api-portal-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  padding: 0;
  margin: 24px 0 0;
  list-style: none;
}

.api-portal-meta li {
  display: inline-flex;
  align-items: center;
  min-height: 32px;
  padding: 7px 12px;
  color: var(--docs-ink);
  font-size: 12px;
  font-weight: 750;
  line-height: 1;
  background: rgba(255, 255, 255, 0.78);
  border: 1px solid rgba(203, 213, 225, 0.86);
  border-radius: 999px;
  box-shadow: var(--docs-shadow-sm);
}

.api-portal-panel {
  position: relative;
  z-index: 1;
  align-self: stretch;
  min-width: 0;
  padding: 18px;
  background: rgba(255, 255, 255, 0.82);
  border: 1px solid rgba(203, 213, 225, 0.82);
  border-radius: var(--docs-radius-md);
  box-shadow: var(--docs-shadow-md);
}

.api-portal-panel-title {
  margin: 0 0 12px;
  color: var(--docs-muted);
  font-size: 12px;
  font-weight: 850;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.api-portal-cards {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
}

.api-portal-card {
  min-width: 0;
  padding: 14px;
  background: var(--docs-surface-subtle);
  border: 1px solid var(--docs-border);
  border-radius: var(--docs-radius-sm);
}

.api-portal-card span {
  display: block;
  margin-bottom: 6px;
  color: var(--docs-faint);
  font-size: 10px;
  font-weight: 850;
  letter-spacing: 0.08em;
  line-height: 1;
  text-transform: uppercase;
}

.api-portal-card strong {
  display: block;
  color: var(--docs-ink);
  font-size: 13px;
  font-weight: 800;
  line-height: 1.35;
}

.swagger-ui .info {
  width: min(100% - 48px, var(--docs-page-max));
  max-width: var(--docs-page-max);
  padding: 28px;
  margin: 0 auto 24px;
  background: var(--docs-surface);
  border: 1px solid var(--docs-border);
  border-radius: var(--docs-radius-lg);
  box-shadow: var(--docs-shadow-md);
  animation: docsFadeUp 420ms var(--docs-ease) both;
}

.swagger-ui .info .title {
  display: none;
}

.swagger-ui .info hgroup.main {
  display: none;
}

.swagger-ui .info .description {
  margin: 0;
}

.swagger-ui .info .description > div > p:first-child {
  margin-top: 0;
  color: var(--docs-text);
  font-size: 15px;
}

.swagger-ui .info .description h2 {
  display: inline-flex;
  align-items: center;
  min-height: 28px;
  padding: 6px 11px;
  margin: 22px 0 10px;
  color: var(--docs-ink);
  font-size: 12px;
  font-weight: 850;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  background: var(--docs-surface-subtle);
  border: 1px solid var(--docs-border);
  border-radius: 999px;
}

.swagger-ui .info .description code,
.swagger-ui .markdown code {
  display: inline-flex;
  align-items: center;
  min-height: 22px;
  padding: 3px 6px;
  color: #b42318;
  font-size: 12px;
  font-weight: 700;
  line-height: 1.2;
  white-space: normal;
  background: var(--docs-danger-soft);
  border: 1px solid rgba(254, 205, 202, 0.92);
  border-radius: var(--docs-radius-xs);
}

.swagger-ui .info pre {
  width: 100%;
  padding: 13px 14px;
  margin: 10px 0 0;
  overflow-x: auto;
  color: var(--docs-code-text);
  background: var(--docs-code-bg);
  border: 1px solid var(--docs-code-border);
  border-radius: var(--docs-radius-sm);
}

.swagger-ui .info pre code {
  display: inline;
  padding: 0;
  color: #f9fafb;
  white-space: pre;
  background: transparent;
  border: 0;
}

.swagger-ui .info ul {
  display: grid;
  gap: 10px;
  padding: 0;
  margin: 12px 0 0;
  list-style: none;
}

.swagger-ui .info li {
  position: relative;
  min-height: 42px;
  padding: 11px 14px 11px 36px;
  background: var(--docs-surface-subtle);
  border: 1px solid var(--docs-border);
  border-radius: var(--docs-radius-sm);
}

.swagger-ui .info li::before {
  position: absolute;
  top: 17px;
  left: 16px;
  width: 8px;
  height: 8px;
  content: "";
  background: var(--docs-accent);
  border-radius: 999px;
  box-shadow: 0 0 0 4px rgba(255, 56, 92, 0.12);
}

.swagger-ui .info .base-url,
.swagger-ui .info .license {
  color: var(--docs-muted);
  font-size: 13px;
}

/* ==========================================================================
   5. Search/filter and server controls
   ========================================================================== */
.swagger-ui .scheme-container {
  width: 100%;
  padding: 0;
  margin: 0 0 28px;
  background: transparent;
  box-shadow: none;
}

.swagger-ui .scheme-container .schemes {
  display: grid;
  grid-template-columns: minmax(150px, 220px) minmax(260px, 1fr) auto;
  align-items: center;
  gap: 16px;
  width: min(100% - 48px, var(--docs-page-max));
  max-width: var(--docs-page-max);
  padding: 18px;
  margin: 0 auto;
  background: var(--docs-surface);
  border: 1px solid var(--docs-border);
  border-radius: var(--docs-radius-lg);
  box-shadow: var(--docs-shadow-md);
}

.swagger-ui .scheme-container .schemes::before {
  color: var(--docs-ink);
  font-size: 12px;
  font-weight: 850;
  letter-spacing: 0.08em;
  content: "Server and authorization";
  text-transform: uppercase;
}

.swagger-ui .scheme-container .schemes > label {
  min-width: 0;
}

.swagger-ui .schemes-server-container,
.swagger-ui .schemes-server-container > div,
.swagger-ui .servers,
.swagger-ui .servers label {
  min-width: 0;
}

.swagger-ui .schemes-server-container > div {
  display: grid;
  gap: 6px;
}

.swagger-ui .servers select {
  width: min(100%, 420px);
}

.swagger-ui .servers-title {
  color: var(--docs-muted);
  font-size: 12px;
  font-weight: 800;
}

.swagger-ui select {
  min-height: 42px;
  padding: 0 44px 0 14px;
  color: var(--docs-ink);
  font-size: 13px;
  font-weight: 700;
  background-color: var(--docs-surface);
  border: 1px solid var(--docs-border-strong);
  border-radius: var(--docs-radius-sm);
  box-shadow: var(--docs-shadow-sm);
  transition:
    border-color 180ms ease,
    box-shadow 180ms ease,
    transform 180ms ease;
}

.swagger-ui select:hover {
  border-color: rgba(255, 56, 92, 0.44);
}

.swagger-ui select:focus-visible {
  outline: 0;
  border-color: var(--docs-accent);
  box-shadow: 0 0 0 4px var(--docs-accent-ring);
}

.swagger-ui .filter-container {
  position: relative;
  width: min(100% - 48px, var(--docs-page-max));
  max-width: var(--docs-page-max);
  padding: 0;
  margin: 0 auto 22px;
}

.swagger-ui .filter-container .filter {
  position: relative;
  width: min(100%, 430px);
  height: auto;
  padding: 0;
  margin: 0;
  background: transparent;
  border: 0;
  box-shadow: none;
}

.swagger-ui .filter-container .filter::before {
  position: absolute;
  top: 16px;
  left: 16px;
  z-index: 1;
  width: 13px;
  height: 13px;
  content: "";
  border: 2px solid var(--docs-muted);
  border-radius: 999px;
}

.swagger-ui .filter-container .filter::after {
  position: absolute;
  top: 28px;
  left: 28px;
  z-index: 1;
  width: 8px;
  height: 2px;
  content: "";
  background: var(--docs-muted);
  border-radius: 999px;
  transform: rotate(45deg);
  transform-origin: left center;
}

.swagger-ui .filter-container .operation-filter-input {
  width: 100%;
  height: 46px;
  padding: 0 16px 0 44px;
  color: var(--docs-ink);
  font-size: 14px;
  font-weight: 650;
  background:
    linear-gradient(var(--docs-surface), var(--docs-surface)) padding-box,
    linear-gradient(135deg, rgba(255, 56, 92, 0.4), rgba(15, 118, 110, 0.24)) border-box;
  border: 1px solid transparent;
  border-radius: var(--docs-radius-md);
  box-shadow: var(--docs-shadow-sm);
  transition:
    border-color 180ms ease,
    box-shadow 180ms ease,
    transform 180ms ease;
}

.swagger-ui .filter-container .operation-filter-input::placeholder {
  color: var(--docs-faint);
  font-weight: 600;
}

.swagger-ui .filter-container .operation-filter-input:hover {
  box-shadow: 0 10px 24px rgba(15, 23, 42, 0.07);
}

.swagger-ui .filter-container .operation-filter-input:focus {
  outline: 0;
  box-shadow:
    0 0 0 4px var(--docs-accent-ring),
    var(--docs-shadow-md);
}

/* ==========================================================================
   6. Tags
   ========================================================================== */
.swagger-ui .opblock-tag-section {
  margin-bottom: 18px;
  animation: docsFadeUp 460ms var(--docs-ease) both;
}

.swagger-ui .opblock-tag {
  position: relative;
  display: flex;
  align-items: center;
  gap: 12px;
  min-height: 76px;
  padding: 18px 20px 18px 64px;
  margin: 0 0 14px;
  color: var(--docs-ink);
  font-size: 18px;
  font-weight: 850;
  background: var(--docs-surface);
  border: 1px solid var(--docs-border);
  border-radius: var(--docs-radius-lg);
  box-shadow: var(--docs-shadow-sm);
  transition:
    transform 180ms var(--docs-ease),
    border-color 180ms ease,
    box-shadow 180ms ease,
    background 180ms ease;
}

.swagger-ui .opblock-tag::before {
  position: absolute;
  left: 20px;
  display: grid;
  width: 32px;
  height: 32px;
  place-items: center;
  color: var(--docs-accent-strong);
  font-size: 13px;
  font-weight: 850;
  content: attr(data-tag-initial);
  background: var(--docs-accent-soft);
  border: 1px solid rgba(255, 56, 92, 0.18);
  border-radius: var(--docs-radius-sm);
}

.swagger-ui .opblock-tag:hover {
  background: linear-gradient(180deg, #ffffff, #fbfcfe);
  border-color: rgba(255, 56, 92, 0.34);
  box-shadow: var(--docs-shadow-md);
  transform: translateY(-1px);
}

.swagger-ui .opblock-tag small {
  display: inline;
  min-width: 0;
  color: var(--docs-muted);
  font-size: 13px;
  font-weight: 650;
  line-height: 1.55;
}

.swagger-ui .opblock-tag svg {
  margin-left: auto;
  color: var(--docs-muted);
  transition: transform 180ms var(--docs-ease);
}

.swagger-ui .opblock-tag[aria-expanded="true"] svg {
  transform: rotate(180deg);
}

/* ==========================================================================
   7. Operation blocks
   ========================================================================== */
.swagger-ui .opblock {
  overflow: hidden;
  margin: 0 0 14px;
  background: var(--docs-surface);
  border: 1px solid var(--docs-border);
  border-radius: var(--docs-radius-lg);
  box-shadow: var(--docs-shadow-sm);
  transition:
    transform 180ms var(--docs-ease),
    border-color 180ms ease,
    box-shadow 180ms ease,
    background 180ms ease;
}

.swagger-ui .opblock:hover {
  border-color: rgba(148, 163, 184, 0.75);
  box-shadow: var(--docs-shadow-md);
  transform: translateY(-1px);
}

.swagger-ui .opblock.is-open {
  border-color: rgba(255, 56, 92, 0.35);
  box-shadow: var(--docs-shadow-lg);
}

.swagger-ui .opblock .opblock-summary {
  align-items: center;
  gap: 12px;
  min-height: 68px;
  padding: 14px 18px;
  border: 0;
}

.swagger-ui .opblock .opblock-summary:hover {
  background: var(--docs-surface-subtle);
}

.swagger-ui .opblock .opblock-summary-control {
  display: flex;
  align-items: center;
  width: 100%;
  min-width: 0;
  gap: 12px;
  padding: 0;
}

.swagger-ui .opblock .opblock-summary-path {
  min-width: 0;
  flex: 1 1 auto;
  color: var(--docs-ink);
  font-family: var(--docs-font-mono);
  font-size: 14px;
  font-weight: 800;
  line-height: 1.45;
  word-break: break-word;
}

.swagger-ui .opblock .opblock-summary-path__deprecated {
  color: var(--docs-muted);
  text-decoration-thickness: 2px;
}

.swagger-ui .opblock .opblock-summary-description {
  min-width: 220px;
  flex: 0 1 34%;
  color: var(--docs-muted);
  font-size: 13px;
  font-weight: 650;
  line-height: 1.5;
}

.swagger-ui .opblock .opblock-section-header {
  min-height: 52px;
  padding: 14px 20px;
  background: var(--docs-surface-subtle);
  border-top: 1px solid var(--docs-border);
  border-bottom: 1px solid var(--docs-border);
  box-shadow: none;
}

.swagger-ui .opblock .opblock-section-header h4 {
  color: var(--docs-ink);
  font-size: 12px;
  font-weight: 850;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.swagger-ui .opblock .opblock-description-wrapper,
.swagger-ui .opblock .opblock-external-docs-wrapper,
.swagger-ui .opblock .opblock-title_normal,
.swagger-ui .responses-wrapper,
.swagger-ui .parameters-container,
.swagger-ui .request-body-wrapper {
  padding: 18px 20px;
}

.swagger-ui .opblock-body {
  border-top: 1px solid var(--docs-border);
}

.swagger-ui .opblock-tag-section.is-open .no-margin,
.swagger-ui .opblock.is-open .opblock-body {
  animation: docsFadeUp 220ms var(--docs-ease) both;
}

/* ==========================================================================
   8. HTTP method badges
   ========================================================================== */
.swagger-ui .opblock .opblock-summary-method {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 74px;
  min-width: 74px;
  height: 34px;
  padding: 0;
  color: #ffffff;
  font-size: 12px;
  font-weight: 850;
  letter-spacing: 0.04em;
  border-radius: var(--docs-radius-sm);
  box-shadow: none;
  text-shadow: none;
}

.swagger-ui .opblock.opblock-get,
.swagger-ui .opblock.opblock-post,
.swagger-ui .opblock.opblock-put,
.swagger-ui .opblock.opblock-patch,
.swagger-ui .opblock.opblock-delete {
  background: var(--docs-surface);
}

.swagger-ui .opblock.opblock-get {
  border-color: rgba(37, 99, 235, 0.24);
}

.swagger-ui .opblock.opblock-get .opblock-summary-method {
  background: #2563eb;
}

.swagger-ui .opblock.opblock-post {
  border-color: rgba(6, 118, 71, 0.24);
}

.swagger-ui .opblock.opblock-post .opblock-summary-method {
  background: var(--docs-success);
}

.swagger-ui .opblock.opblock-put {
  border-color: rgba(181, 71, 8, 0.28);
}

.swagger-ui .opblock.opblock-put .opblock-summary-method {
  background: var(--docs-warning);
}

.swagger-ui .opblock.opblock-patch {
  border-color: rgba(15, 118, 110, 0.28);
}

.swagger-ui .opblock.opblock-patch .opblock-summary-method {
  background: var(--docs-teal);
}

.swagger-ui .opblock.opblock-delete {
  border-color: rgba(217, 45, 32, 0.26);
}

.swagger-ui .opblock.opblock-delete .opblock-summary-method {
  background: var(--docs-danger);
}

/* ==========================================================================
   9. Parameters
   ========================================================================== */
.swagger-ui table {
  width: 100%;
  overflow: hidden;
  background: var(--docs-surface);
  border: 1px solid var(--docs-border);
  border-collapse: separate;
  border-radius: var(--docs-radius-sm);
  border-spacing: 0;
}

.swagger-ui table thead tr td,
.swagger-ui table thead tr th {
  padding: 12px 14px;
  color: var(--docs-muted);
  font-size: 11px;
  font-weight: 850;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  background: var(--docs-surface-subtle);
  border-bottom: 1px solid var(--docs-border);
}

.swagger-ui table tbody tr td {
  padding: 14px;
  border-top: 1px solid var(--docs-divider);
}

.swagger-ui table tbody tr:first-child td {
  border-top: 0;
}

.swagger-ui .parameters-col_description {
  width: auto;
}

.swagger-ui .parameter__name {
  color: var(--docs-ink);
  font-size: 13px;
  font-weight: 850;
}

.swagger-ui .parameter__name.required::after {
  color: var(--docs-accent-strong);
}

.swagger-ui .parameter__type,
.swagger-ui .prop-type {
  color: var(--docs-info);
  font-size: 12px;
  font-weight: 800;
}

.swagger-ui .parameter__in,
.swagger-ui .prop-format {
  color: var(--docs-muted);
  font-size: 11px;
  font-weight: 750;
}

.swagger-ui input[type="text"],
.swagger-ui input[type="password"],
.swagger-ui input[type="email"],
.swagger-ui input[type="number"],
.swagger-ui textarea {
  min-height: 42px;
  padding: 10px 12px;
  color: var(--docs-ink);
  font-family: var(--docs-font-sans);
  font-size: 14px;
  background: var(--docs-surface);
  border: 1px solid var(--docs-border-strong);
  border-radius: var(--docs-radius-sm);
  box-shadow: var(--docs-shadow-sm);
  transition:
    border-color 180ms ease,
    box-shadow 180ms ease;
}

.swagger-ui textarea {
  min-height: 130px;
  font-family: var(--docs-font-mono);
  line-height: 1.55;
}

.swagger-ui input:hover,
.swagger-ui textarea:hover {
  border-color: rgba(255, 56, 92, 0.44);
}

.swagger-ui input:focus,
.swagger-ui textarea:focus {
  outline: 0;
  border-color: var(--docs-accent);
  box-shadow: 0 0 0 4px var(--docs-accent-ring);
}

/* ==========================================================================
   10. Request body
   ========================================================================== */
.swagger-ui .request-body-wrapper {
  background: linear-gradient(180deg, var(--docs-surface), var(--docs-surface-subtle));
  border-top: 1px solid var(--docs-border);
}

.swagger-ui .opblock-section-request-body {
  color: var(--docs-ink);
}

.swagger-ui .body-param-options {
  gap: 10px;
  margin: 12px 0;
}

.swagger-ui .body-param__text {
  min-height: 180px;
}

.swagger-ui .model-box {
  padding: 14px;
  background: var(--docs-surface);
  border: 1px solid var(--docs-border);
  border-radius: var(--docs-radius-sm);
}

/* ==========================================================================
   11. Responses
   ========================================================================== */
.swagger-ui .responses-inner {
  padding: 0;
}

.swagger-ui .responses-table {
  margin: 0;
}

.swagger-ui .response-col_status {
  color: var(--docs-ink);
  font-family: var(--docs-font-mono);
  font-weight: 850;
}

.swagger-ui .response-col_description__inner div.markdown,
.swagger-ui .response-col_description__inner p {
  color: var(--docs-text);
}

.swagger-ui .response-control-media-type__accept-message {
  color: var(--docs-success);
  font-size: 12px;
  font-weight: 750;
}

.swagger-ui .responses-header td {
  background: var(--docs-surface-subtle);
}

.swagger-ui .live-responses-table {
  margin-top: 16px;
}

.swagger-ui .response-undocumented {
  color: var(--docs-danger);
  font-weight: 800;
}

/* ==========================================================================
   12. Models
   ========================================================================== */
.swagger-ui section.models {
  padding: 0;
  margin-top: 32px;
  overflow: hidden;
  background: var(--docs-surface);
  border: 1px solid var(--docs-border);
  border-radius: var(--docs-radius-lg);
  box-shadow: var(--docs-shadow-md);
}

.swagger-ui section.models.is-open {
  padding-bottom: 8px;
}

.swagger-ui section.models h4 {
  display: flex;
  align-items: center;
  min-height: 72px;
  padding: 20px;
  margin: 0;
  color: var(--docs-ink);
  font-size: 16px;
  font-weight: 850;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  background: linear-gradient(180deg, #ffffff, var(--docs-surface-subtle));
  border-bottom: 1px solid var(--docs-border);
}

.swagger-ui section.models h4 svg {
  margin-left: auto;
  color: var(--docs-muted);
}

.swagger-ui section.models .model-container {
  margin: 12px;
  background: var(--docs-surface-raised);
  border: 1px solid var(--docs-border);
  border-radius: var(--docs-radius-sm);
  box-shadow: none;
}

.swagger-ui section.models .model-container:hover {
  border-color: rgba(255, 56, 92, 0.34);
}

.swagger-ui section.models .model-box {
  background: var(--docs-surface);
  border: 0;
}

.swagger-ui .model-title,
.swagger-ui .model-title__text {
  color: var(--docs-ink);
  font-size: 14px;
  font-weight: 850;
}

.swagger-ui .model {
  color: var(--docs-text);
  font-family: var(--docs-font-mono);
  font-size: 12px;
  line-height: 1.65;
}

.swagger-ui .model .property {
  color: var(--docs-ink);
  font-weight: 800;
}

.swagger-ui .model-toggle::after {
  background-size: 16px;
}

/* ==========================================================================
   13. Code blocks
   ========================================================================== */
.swagger-ui .highlight-code,
.swagger-ui .microlight,
.swagger-ui pre,
.swagger-ui code {
  font-family: var(--docs-font-mono);
}

.swagger-ui .highlight-code {
  position: relative;
}

.swagger-ui .highlight-code > .microlight,
.swagger-ui .microlight {
  padding: 16px;
  overflow-x: auto;
  color: var(--docs-code-text);
  font-size: 12px;
  line-height: 1.65;
  background: var(--docs-code-bg);
  border: 1px solid var(--docs-code-border);
  border-radius: var(--docs-radius-sm);
}

.swagger-ui pre {
  border-radius: var(--docs-radius-sm);
}

.swagger-ui .copy-to-clipboard {
  width: 34px;
  height: 34px;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.16);
  border-radius: var(--docs-radius-sm);
  transition:
    background 180ms ease,
    transform 180ms var(--docs-ease);
}

.swagger-ui .copy-to-clipboard:hover {
  background: rgba(255, 255, 255, 0.14);
  transform: translateY(-1px);
}

.swagger-ui .curl-command {
  border-radius: var(--docs-radius-sm);
}

/* ==========================================================================
   14. Buttons
   ========================================================================== */
.swagger-ui .btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 40px;
  gap: 8px;
  padding: 0 16px;
  color: var(--docs-ink);
  font-size: 13px;
  font-weight: 800;
  line-height: 1;
  background: var(--docs-surface);
  border: 1px solid var(--docs-border-strong);
  border-radius: var(--docs-radius-sm);
  box-shadow: var(--docs-shadow-sm);
  transition:
    background 180ms ease,
    border-color 180ms ease,
    box-shadow 180ms ease,
    color 180ms ease,
    transform 180ms var(--docs-ease);
}

.swagger-ui .btn:hover {
  background: var(--docs-surface-subtle);
  border-color: rgba(255, 56, 92, 0.42);
  box-shadow: var(--docs-shadow-md);
  transform: translateY(-1px);
}

.swagger-ui .btn:active {
  transform: translateY(0);
}

.swagger-ui .btn.execute,
.swagger-ui .btn.try-out__btn {
  color: #ffffff;
  background: linear-gradient(135deg, var(--docs-accent), var(--docs-accent-strong));
  border-color: transparent;
}

.swagger-ui .btn.execute:hover,
.swagger-ui .btn.try-out__btn:hover {
  background: linear-gradient(135deg, #ff5270, var(--docs-accent-strong));
}

.swagger-ui .btn.cancel {
  color: var(--docs-danger);
  background: var(--docs-danger-soft);
  border-color: rgba(254, 205, 202, 0.95);
}

.swagger-ui .btn-group {
  gap: 8px;
}

/* ==========================================================================
   15. Authorization
   ========================================================================== */
.swagger-ui .auth-wrapper {
  justify-content: flex-end;
}

.swagger-ui .authorize {
  min-height: 42px;
  padding: 0 16px;
  color: #ffffff;
  background: linear-gradient(135deg, var(--docs-success), var(--docs-teal));
  border: 0;
  border-radius: 999px;
  box-shadow: 0 14px 30px rgba(6, 118, 71, 0.2);
}

.swagger-ui .authorize span {
  color: #ffffff;
  font-size: 12px;
  font-weight: 850;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.swagger-ui .authorize svg {
  fill: currentColor;
}

.swagger-ui .authorize:hover {
  box-shadow: 0 18px 36px rgba(6, 118, 71, 0.26);
  transform: translateY(-1px);
}

.swagger-ui .auth-container {
  padding: 20px;
  background: var(--docs-surface);
  border: 1px solid var(--docs-border);
  border-radius: var(--docs-radius-lg);
}

.swagger-ui .auth-container h4,
.swagger-ui .auth-container .wrapper {
  color: var(--docs-ink);
}

.swagger-ui .auth-container .errors-wrapper {
  border-radius: var(--docs-radius-sm);
}

.swagger-ui .dialog-ux .modal-ux {
  width: min(640px, calc(100vw - 32px));
  overflow: hidden;
  background: var(--docs-surface);
  border: 1px solid var(--docs-border);
  border-radius: var(--docs-radius-lg);
  box-shadow: 0 28px 80px rgba(15, 23, 42, 0.22);
}

.swagger-ui .dialog-ux .modal-ux-header {
  padding: 18px 20px;
  background: linear-gradient(180deg, #ffffff, var(--docs-surface-subtle));
  border-bottom: 1px solid var(--docs-border);
}

.swagger-ui .dialog-ux .modal-ux-header h3 {
  color: var(--docs-ink);
  font-size: 16px;
  font-weight: 850;
}

.swagger-ui .dialog-ux .modal-ux-content {
  padding: 20px;
}

.swagger-ui .dialog-ux .modal-ux-content p,
.swagger-ui .dialog-ux .modal-ux-content label {
  color: var(--docs-text);
}

.swagger-ui .dialog-ux .modal-ux-content code {
  color: var(--docs-accent-strong);
  background: var(--docs-accent-soft);
  border-radius: var(--docs-radius-xs);
}

.swagger-ui .dialog-ux .modal-ux-header .close-modal {
  width: 34px;
  height: 34px;
  border-radius: var(--docs-radius-sm);
  transition:
    background 180ms ease,
    transform 180ms var(--docs-ease);
}

.swagger-ui .dialog-ux .modal-ux-header .close-modal:hover {
  background: var(--docs-surface-subtle);
  transform: translateY(-1px);
}

/* ==========================================================================
   16. Responsive
   ========================================================================== */
@media (max-width: 900px) {
  .swagger-ui .wrapper,
  .swagger-ui .information-container.wrapper,
  .swagger-ui .scheme-container .wrapper,
  .swagger-ui .opblock-tag-section,
  .swagger-ui .models,
  .swagger-ui .info,
  .swagger-ui .filter-container,
  .api-portal-hero {
    width: min(100% - 32px, var(--docs-page-max));
  }

  .api-portal-shell {
    grid-template-columns: 1fr;
    padding: 28px;
  }

  .api-portal-title {
    font-size: clamp(38px, 10vw, 58px);
  }

  .swagger-ui .scheme-container .schemes {
    grid-template-columns: 1fr;
  }

  .swagger-ui .auth-wrapper {
    justify-content: flex-start;
  }

  .swagger-ui .opblock .opblock-summary {
    align-items: flex-start;
  }

  .swagger-ui .opblock .opblock-summary-control {
    flex-wrap: wrap;
  }

  .swagger-ui .opblock .opblock-summary-description {
    min-width: 100%;
    flex-basis: 100%;
    padding-left: 86px;
  }
}

@media (max-width: 640px) {
  body {
    background:
      radial-gradient(circle at 20% -12%, rgba(255, 56, 92, 0.16), transparent 20rem),
      linear-gradient(180deg, #ffffff 0, #f6f8fb 22rem, #f6f8fb 100%);
  }

  .swagger-ui .topbar {
    min-height: 60px;
  }

  .swagger-ui .topbar .topbar-wrapper {
    width: calc(100% - 28px);
    min-height: 60px;
  }

  .swagger-ui .topbar .link::before {
    width: 32px;
    height: 32px;
  }

  .api-portal-hero {
    width: calc(100% - 28px);
    margin-top: 16px;
    margin-bottom: 18px;
  }

  .api-portal-shell {
    gap: 22px;
    padding: 24px 18px;
    border-radius: var(--docs-radius-md);
  }

  .api-portal-title {
    font-size: 39px;
    line-height: 1.02;
  }

  .api-portal-summary {
    font-size: 15px;
  }

  .api-portal-cards {
    grid-template-columns: 1fr;
  }

  .swagger-ui .info {
    width: calc(100% - 28px);
    padding: 20px 18px;
  }

  .swagger-ui .filter-container {
    width: calc(100% - 28px);
  }

  .swagger-ui .filter-container .filter {
    width: 100%;
  }

  .swagger-ui .scheme-container .wrapper,
  .swagger-ui .opblock-tag-section,
  .swagger-ui section.models {
    width: calc(100% - 28px);
  }

  .swagger-ui .opblock-tag {
    min-height: 68px;
    padding: 16px 16px 16px 58px;
    font-size: 16px;
  }

  .swagger-ui .opblock-tag::before {
    left: 16px;
    width: 30px;
    height: 30px;
  }

  .swagger-ui .opblock .opblock-summary {
    min-height: 64px;
    padding: 14px;
  }

  .swagger-ui .opblock .opblock-summary-method {
    width: 66px;
    min-width: 66px;
    height: 32px;
  }

  .swagger-ui .opblock .opblock-summary-path {
    flex-basis: calc(100% - 84px);
    font-size: 13px;
  }

  .swagger-ui .opblock .opblock-summary-description {
    padding-left: 0;
  }

  .swagger-ui .opblock .opblock-description-wrapper,
  .swagger-ui .opblock .opblock-external-docs-wrapper,
  .swagger-ui .opblock .opblock-title_normal,
  .swagger-ui .responses-wrapper,
  .swagger-ui .parameters-container,
  .swagger-ui .request-body-wrapper {
    padding: 16px 14px;
  }

  .swagger-ui table {
    display: block;
    overflow-x: auto;
  }

  .swagger-ui table thead,
  .swagger-ui table tbody,
  .swagger-ui table tr {
    width: 100%;
  }

  .swagger-ui .btn {
    min-height: 38px;
    padding-right: 12px;
    padding-left: 12px;
  }
}

/* ==========================================================================
   17. Accessibility
   ========================================================================== */
.swagger-ui button:focus-visible,
.swagger-ui a:focus-visible,
.swagger-ui .opblock-summary-control:focus-visible,
.swagger-ui .opblock-tag:focus-visible,
.swagger-ui .btn:focus-visible,
.swagger-ui .authorize:focus-visible,
.swagger-ui select:focus-visible {
  outline: 0;
  box-shadow: 0 0 0 4px var(--docs-accent-ring);
}

.swagger-ui .opblock-summary-control:focus-visible,
.swagger-ui .opblock-tag:focus-visible {
  border-radius: var(--docs-radius-sm);
}

.swagger-ui .errors-wrapper {
  color: var(--docs-danger);
  background: var(--docs-danger-soft);
  border: 1px solid rgba(254, 205, 202, 0.95);
  border-radius: var(--docs-radius-sm);
}

/* ==========================================================================
   18. Reduced motion
   ========================================================================== */
@keyframes docsFadeUp {
  from {
    opacity: 0;
    transform: translateY(10px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    scroll-behavior: auto;
    animation-duration: 0.001ms;
    animation-iteration-count: 1;
    transition-duration: 0.001ms;
  }
}
`;
