export const SWAGGER_UI_CUSTOM_CSS = `
:root { color-scheme: light; --docs-bg: #f5f7fb; --docs-ink: #17243b; --docs-muted: #64748b; --docs-border: #dce3ed; --docs-blue: #2563eb; --docs-font: Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; }
html { scroll-padding-top: 160px; background: var(--docs-bg); }
body { margin: 0; background: var(--docs-bg); color: var(--docs-ink); font-family: var(--docs-font); }
* { box-sizing: border-box; }
.swagger-ui { color: var(--docs-ink); font-family: var(--docs-font); }
.swagger-ui .topbar { display: none; }
.swagger-ui .api-portal-tab:hover { background: #f1f5f9; }
.swagger-ui .api-docs-resource-link:hover { background: #eff6ff; color: #1d4ed8; }
.swagger-ui .information-container { padding: 0; background: transparent; }
.swagger-ui .info .title small pre { font-size: 11px; color: #475569; }
.swagger-ui .info p, .swagger-ui .info li { font-size: 14px; line-height: 1.7; color: #64748b; font-family: var(--docs-font); }
.swagger-ui .info a { color: #2563eb; }
.swagger-ui .info .url, .swagger-ui .info .info__contact, .swagger-ui .info .info__license { display: none; }
.swagger-ui select { border: 1px solid var(--docs-border); border-radius: 5px; padding: 8px 30px 8px 10px; background-color: #fff; color: var(--docs-ink); box-shadow: none; font-family: var(--docs-font); font-size: 12px; }
.swagger-ui .btn { box-shadow: none; border-radius: 5px; font-family: var(--docs-font); font-size: 12px; padding: 8px 16px; }
.swagger-ui .opblock.opblock-get { background: #f4f8ff; border-color: #cbdcf6; }
.swagger-ui .opblock.opblock-post { background: #f1faf6; border-color: #bfe4d1; }
.swagger-ui .opblock.opblock-patch { background: #fffbf2; border-color: #efdeb8; }
.swagger-ui .opblock.opblock-put { background: #faf5ff; border-color: #dfcff3; }
.swagger-ui .opblock.opblock-delete { background: #fff5f5; border-color: #f0caca; }
.swagger-ui .api-docs-access[data-access="public"] { color: #166534; }
.swagger-ui .opblock-body { background: #fff; }
.swagger-ui .opblock .opblock-section-header { box-shadow: none; background: #f8fafc; padding: 12px 18px; }
.swagger-ui .opblock .opblock-section-header h4 { font-family: var(--docs-font); font-size: 13px; color: var(--docs-ink); }
.swagger-ui .opblock-description-wrapper p, .swagger-ui .response-col_description p { font-family: var(--docs-font); color: #475569; font-size: 13px; line-height: 1.6; }
.swagger-ui table thead tr th, .swagger-ui table thead tr td { font-family: var(--docs-font); font-size: 12px; color: #64748b; border-color: var(--docs-border); }
.swagger-ui .parameters-col_description input, .swagger-ui textarea { border: 1px solid #cbd5e1; border-radius: 5px; background: #fff; }
.swagger-ui .btn.execute { background: #2563eb; border-color: #2563eb; }
.swagger-ui .highlight-code, .swagger-ui .microlight { border-radius: 5px; }
.swagger-ui .dialog-ux .modal-ux { border-radius: 10px; border: 1px solid var(--docs-border); box-shadow: 0 20px 60px #0f172a25; }
.swagger-ui .dialog-ux .modal-ux-header h3 { font-family: var(--docs-font); font-size: 18px; }
.swagger-ui .api-docs-authorize-refresh { margin: 18px 0; padding: 12px; background: #f8fafc; border: 1px solid var(--docs-border); border-radius: 6px; }
.swagger-ui .api-docs-authorize-refresh-header { display: grid; gap: 6px; }
.swagger-ui .api-docs-authorize-refresh-title { font-size: 13px; font-weight: 600; }
.swagger-ui .api-docs-authorize-refresh-copy, .swagger-ui .api-docs-authorize-refresh-value { font-size: 12px; color: #64748b; line-height: 1.6; }
a:focus-visible, button:focus-visible, input:focus-visible, select:focus-visible { outline: 2px solid #2563eb; outline-offset: 3px; }
.swagger-ui .api-portal-hero { position: sticky; top: 0; z-index: 30; display: flex; align-items: center; flex-wrap: nowrap; gap: 18px; padding: 0 28px; background: #fff; border-bottom: 1px solid var(--docs-border); height: 72px; }
.swagger-ui .api-portal-brand { font-size: 18px; font-weight: 750; letter-spacing: -.4px; }
.swagger-ui .api-portal-meta { color: var(--docs-muted); font-size: 11px; padding: 5px 9px; background: #f1f5f9; border-radius: 5px; }
.swagger-ui .api-portal-tabs { display: flex; gap: 4px; margin-left: auto; padding: 4px; border: 1px solid #e2e8f0; border-radius: 8px; background: #f8fafc; }
.swagger-ui .api-portal-tab { padding: 8px 14px; border-radius: 6px; color: #475569; font-size: 13px; text-decoration: none; font-weight: 600; min-width: 78px; text-align: center; }
.swagger-ui .api-portal-tab[aria-current="page"] { background: #fff; color: #1d4ed8; box-shadow: 0 1px 3px #0f172a15; }
.swagger-ui .api-docs-sidebar { position: fixed; top: 72px; bottom: 0; width: 264px; padding: 28px 16px; overflow-y: auto; background: #fff; border-right: 1px solid var(--docs-border); }
.swagger-ui .api-docs-sidebar-title { margin: 0 12px 16px; font-size: 10px; color: var(--docs-muted); font-weight: 700; letter-spacing: 1.5px; margin-bottom: 20px; }
.swagger-ui .api-docs-sidebar nav { display: grid; gap: 18px; }
.swagger-ui .api-docs-resource-link { display: flex; padding: 8px 10px; border-radius: 6px; font-size: 14px; text-decoration: none; color: #1e293b; align-items: center; justify-content: space-between; font-weight: 650; }
.swagger-ui .api-docs-resource-count { color: #64748b; font-size: 11px; font-weight: 500; }
.swagger-ui .api-docs-operation-link { display: flex; align-items: center; gap: 9px; width: 100%; padding: 9px 10px; text-align: left; border: 0; border-radius: 6px; background: transparent; cursor: pointer; font-family: var(--docs-font); }
.swagger-ui .api-docs-operation-link:hover, .swagger-ui .api-docs-operation-link[aria-current] { background: #eff6ff; }
.swagger-ui .api-docs-nav-method { flex: 0 0 38px; font-size: 9px; letter-spacing: .3px; font-weight: 750; color: #2563eb; }
.swagger-ui .api-docs-method-post { color: #15803d; }
.swagger-ui .api-docs-method-patch { color: #a16207; }
.swagger-ui .api-docs-method-put { color: #7e22ce; }
.swagger-ui .api-docs-method-delete { color: #b91c1c; }
.swagger-ui .api-docs-nav-summary { font-size: 13px; color: #475569; line-height: 1.5; }
.swagger-ui > .swagger-ui { margin-left: 264px; padding: 32px clamp(24px, 3vw, 56px) 64px; }
.swagger-ui .wrapper { max-width: none; padding: 0; width: 100%; margin-left: 0; margin-right: 0; }
.swagger-ui .information-container.wrapper { padding: 0; }
.swagger-ui .info { margin: 0 0 24px; }
.swagger-ui .api-docs-overview { display: flex; align-items: center; gap: 16px; margin-bottom: 12px; font-size: 10px; font-weight: 700; letter-spacing: 1.6px; color: #2563eb; }
.swagger-ui .api-docs-overview span { color: #64748b; font-weight: 400; font-size: 12px; letter-spacing: 0; }
.swagger-ui .info .title { margin: 0 0 8px; font-family: var(--docs-font); font-size: 30px; letter-spacing: -.9px; color: var(--docs-ink); }
.swagger-ui .info .title small { top: 0; background: #e8eef7; color: #475569; border-radius: 4px; padding: 2px 6px; display: none; }
.swagger-ui .info .description p { margin: 10px 0 0; max-width: 850px; font-size: 14px; line-height: 1.65; }
.swagger-ui .scheme-container { padding: 12px 16px; margin: 0 0 18px; border: 1px solid var(--docs-border); border-radius: 8px; background: #fff; box-shadow: none; }
.swagger-ui .scheme-container .schemes { align-items: center; gap: 12px; display: flex; flex-wrap: wrap; justify-content: flex-start; }
.swagger-ui .scheme-container .servers { flex: 0 1 auto; display: flex; align-items: center; gap: 10px; }
.swagger-ui .servers > label { margin: 0; display: flex; gap: 10px; align-items: center; }
.swagger-ui .servers-title { color: var(--docs-muted); font-size: 12px; margin-bottom: 5px; margin: 0; font-weight: 500; }
.swagger-ui .servers select { max-width: 330px; font-weight: 500; font-size: 12px; }
.swagger-ui .scheme-container .auth-wrapper { flex: 0 0 auto; order: 3; margin-left: auto; }
.swagger-ui .api-docs-language-panel { flex-basis: auto; display: flex; align-items: center; gap: 14px; border-top: 1px solid #edf1f6; padding-top: 10px; padding: 0; border: 0; }
.swagger-ui .api-docs-language-panel label { display: flex; align-items: center; gap: 8px; font-size: 12px; color: #475569; }
.swagger-ui .api-docs-language-panel select { background: #fff; border: 1px solid var(--docs-border); border-radius: 5px; padding: 8px 24px 8px 9px; color: var(--docs-ink); font-size: 12px; }
.swagger-ui .api-docs-language-panel-status { color: var(--docs-muted); font-size: 12px; position: absolute; width: 1px; height: 1px; overflow: hidden; clip-path: inset(50%); white-space: nowrap; }
.swagger-ui .api-docs-clear-session { margin-left: auto; padding: 8px 10px; border: 1px solid var(--docs-border); border-radius: 5px; background: #fff; color: #475569; cursor: pointer; font-size: 12px; margin: 0; }
.swagger-ui .btn.authorize { border: 1px solid #2563eb; color: #fff; background: #2563eb; border-color: #2563eb; padding: 9px 14px; font-size: 12px; }
.swagger-ui .btn.authorize svg { fill: #fff; width: 13px; height: 13px; }
.swagger-ui .btn.authorize svg path { fill: #fff; }
.swagger-ui section.filter { padding: 0; margin: 0 0 26px; background: transparent; border: 0; }
.swagger-ui section.filter .operation-filter-input { min-width: 0; width: 100%; padding: 12px 14px; border: 1px solid var(--docs-border); border-radius: 7px; background: #fff; font-family: var(--docs-font); font-size: 13px; display: block; max-width: none; }
.swagger-ui .opblock-tag-section { margin: 0 0 18px; margin-bottom: 28px; }
.swagger-ui .opblock-tag { padding: 0 0 12px; margin: 0 0 10px; background: transparent; border: 0; border-radius: 0; color: var(--docs-ink); font-family: var(--docs-font); font-size: 18px; scroll-margin-top: 92px; border-bottom: 1px solid var(--docs-border); margin-bottom: 12px; }
.swagger-ui .opblock-tag:hover { background: transparent; }
.swagger-ui .opblock-tag small { color: #64748b; font-size: 12px; font-weight: 400; display: none; }
.swagger-ui .opblock-tag .api-docs-tag-count { flex: 0 0 auto !important; width: auto; color: #64748b; font-size: 11px; font-weight: 400; padding: 3px 8px; margin-left: 12px; border: 1px solid var(--docs-border); border-radius: 4px; }
.swagger-ui .opblock { margin: 0 0 8px; border-radius: 7px; box-shadow: none; background: #fff !important; border: 1px solid var(--docs-border) !important; margin-bottom: 9px; scroll-margin-top: 92px; }
.swagger-ui .opblock:hover { border-color: #afbed1 !important; }
.swagger-ui .opblock .opblock-summary { padding: 12px 14px; gap: 12px; min-height: 58px; }
.swagger-ui .opblock .opblock-summary-control { align-items: center; padding: 0; min-height: 32px; }
.swagger-ui .opblock .opblock-summary-method { min-width: 66px; border-radius: 4px; font-family: var(--docs-font); font-size: 11px; padding: 6px 10px; text-shadow: none; box-shadow: none; }
.swagger-ui .opblock .opblock-summary-path { color: #24334b; font-family: Consolas, "Liberation Mono", monospace; font-size: 14px; font-weight: 500; max-width: none; }
.swagger-ui .opblock .opblock-summary-description { color: #475569; font-family: var(--docs-font); font-size: 13px; padding-left: 12px; }
.swagger-ui .opblock.opblock-get .opblock-summary-method { background: #eff6ff; color: #1d4ed8; }
.swagger-ui .opblock.opblock-post .opblock-summary-method { background: #ecfdf3; color: #15803d; }
.swagger-ui .opblock.opblock-patch .opblock-summary-method { background: #fffbeb; color: #a16207; }
.swagger-ui .opblock.opblock-put .opblock-summary-method { background: #faf5ff; color: #7e22ce; }
.swagger-ui .opblock.opblock-delete .opblock-summary-method { background: #fef2f2; color: #b91c1c; }
.swagger-ui .api-docs-access { order: 5; white-space: nowrap; color: #475569; background: #f8fafc; border: 0; border-radius: 4px; padding: 4px 8px; font-size: 11px; }
.swagger-ui section.models { border: 1px solid var(--docs-border); border-radius: 7px; background: #fff; margin: 32px 0 0; }
.swagger-ui section.models h4 { font-family: var(--docs-font); font-size: 13px; }
.swagger-ui .opblock-tag .expand-operation { margin-left: auto; }
.swagger-ui .api-docs-sidebar { scrollbar-width: thin; scrollbar-color: #cbd5e1 transparent; }
.swagger-ui .api-docs-sidebar::-webkit-scrollbar { width: 5px; }
.swagger-ui .api-docs-sidebar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 8px; }
.swagger-ui .api-docs-operation-link[aria-current] { box-shadow: inset 2px 0 #2563eb; }
.swagger-ui .api-docs-operation-link[aria-current] .api-docs-nav-summary { color: #1d4ed8; }
.swagger-ui .api-docs-session-status { white-space: nowrap; border-radius: 5px; padding: 6px 8px; font-size: 11px; background: #f1f5f9; color: #64748b; }
.swagger-ui .api-docs-session-status[data-state="authorized"] { color: #166534; background: #ecfdf3; }
.swagger-ui textarea.body-param__text { min-height: 140px; height: 160px; max-height: 440px; resize: vertical; padding: 14px; font: 13px/1.65 Consolas, monospace; background: #fbfcfe; color: #17243b; }
.swagger-ui .opblock-description-wrapper p, .swagger-ui .response-col_description p { font-size: 14px; }
.swagger-ui .opblock .opblock-section-header { padding: 12px 18px; min-height: 48px; }
.swagger-ui .opblock .opblock-summary { border-bottom-color: #dce3ed; }
.swagger-ui .execute-wrapper { padding: 14px 20px; }
.swagger-ui .execute-wrapper .btn.execute { width: auto; min-width: 140px; padding: 10px 22px; }
.swagger-ui .opblock-summary-control:focus { outline: none; }
.swagger-ui .opblock-summary-control:focus-visible { outline: 2px solid #2563eb; outline-offset: 3px; border-radius: 4px; }

.swagger-ui .scheme-container { padding: 18px 20px; background: #fff; border-color: #d8e2ef; border-radius: 10px; }
.swagger-ui .api-docs-toolbar-heading { display: flex; align-items: center; justify-content: space-between; padding-bottom: 14px; margin-bottom: 16px; border-bottom: 1px solid #edf1f7; font-size: 13px; font-weight: 650; color: #24334b; }
.swagger-ui .api-docs-toolbar-heading span { font-size: 12px; font-weight: 400; color: #64748b; }
.swagger-ui .scheme-container .schemes { gap: 18px; align-items: flex-end; }
.swagger-ui .scheme-container .servers { display: block; }
.swagger-ui .servers-title { font-size: 11px; margin: 0 0 7px; color: #64748b; }
.swagger-ui .api-docs-language-panel { gap: 14px; align-items: flex-end; }
.swagger-ui .api-docs-language-panel label { display: flex; flex-direction: column; align-items: flex-start; gap: 7px; color: #64748b; font-size: 11px; }
.swagger-ui .scheme-container select.api-docs-native-select { position: absolute; width: 1px; height: 1px; min-width: 0; padding: 0; margin: -1px; overflow: hidden; clip-path: inset(50%); pointer-events: none; }
.swagger-ui .api-docs-dropdown { position: relative; min-width: 120px; }
.swagger-ui .servers .api-docs-dropdown { min-width: 320px; }
.swagger-ui .api-docs-dropdown-trigger { display: flex; align-items: center; justify-content: space-between; gap: 20px; width: 100%; height: 40px; padding: 0 12px; background: #f8fafc; border: 1px solid #d8e2ef; border-radius: 7px; color: #24334b; font-family: var(--docs-font); font-size: 12px; font-weight: 500; text-align: left; cursor: pointer; }
.swagger-ui .api-docs-dropdown-trigger::after { content: ''; width: 6px; height: 6px; flex-shrink: 0; border-right: 1.5px solid #64748b; border-bottom: 1.5px solid #64748b; transform: rotate(45deg); margin-top: -3px; }
.swagger-ui .api-docs-dropdown-trigger:hover { background: #f1f5f9; border-color: #aebed2; }
.swagger-ui .api-docs-dropdown-trigger[aria-expanded="true"] { border-color: #2563eb; background: #fff; box-shadow: 0 0 0 3px #2563eb12; }
.swagger-ui .api-docs-dropdown-menu { position: absolute; z-index: 45; top: calc(100% + 7px); left: 0; min-width: 100%; max-height: 240px; overflow: auto; padding: 5px; background: #fff; border: 1px solid #d8e2ef; border-radius: 8px; box-shadow: 0 12px 30px #17243b18; }
.swagger-ui .api-docs-dropdown-menu[hidden] { display: none; }
.swagger-ui .api-docs-dropdown-option { display: flex; justify-content: space-between; align-items: center; gap: 18px; width: 100%; padding: 10px; border: 0; border-radius: 5px; background: #fff; color: #334155; font-family: var(--docs-font); font-size: 12px; text-align: left; white-space: nowrap; cursor: pointer; }
.swagger-ui .api-docs-dropdown-option:hover, .swagger-ui .api-docs-dropdown-option:focus-visible { background: #f1f5f9; outline: none; }
.swagger-ui .api-docs-dropdown-option[aria-selected="true"] { color: #1d4ed8; background: #eff6ff; font-weight: 600; }
.swagger-ui .api-docs-dropdown-option[aria-selected="true"]::after { content: '\\2713'; font-size: 14px; }
.swagger-ui .api-docs-clear-session { height: 40px; padding: 0 12px; border-radius: 7px; }
.swagger-ui .api-docs-session-status { display: flex; align-items: center; gap: 7px; height: 40px; background: transparent; }
.swagger-ui .api-docs-session-status::before { content: ''; width: 6px; height: 6px; border-radius: 50%; background: #94a3b8; }
.swagger-ui .api-docs-session-status[data-state="authorized"]::before { background: #16a34a; }
.swagger-ui .btn.authorize { min-height: 40px; border-radius: 7px; padding: 10px 18px; }
@media (max-width: 540px) {
  .swagger-ui .api-docs-toolbar-heading span { display: none; }
  .swagger-ui .scheme-container { padding: 16px; }
  .swagger-ui .servers .api-docs-dropdown { min-width: 0; width: 100%; }
  .swagger-ui .api-docs-language-panel { flex-wrap: wrap; }
  .swagger-ui .api-docs-dropdown { min-width: 110px; }
  .swagger-ui .api-docs-dropdown-trigger { font-size: 11px; gap: 10px; }
}
.swagger-ui .api-docs-navigation-status { font-size: 12px; color: #64748b; }
#swagger-ui[aria-busy="true"] .scheme-container, #swagger-ui[aria-busy="true"] .opblock { pointer-events: none; opacity: .6; }

.swagger-ui .api-docs-dual-auth-ready .auth-container { display: none; }
.swagger-ui .api-docs-dual-auth-ready .modal-ux-content { padding: 20px 24px; }
.swagger-ui .api-docs-auth-context { margin: 0 0 18px; font-size: 13px; color: #64748b; line-height: 1.6; }
.swagger-ui .api-docs-auth-card { border: 1px solid #dce3ed; border-radius: 9px; padding: 18px; margin-bottom: 14px; background: #fbfcfe; }
.swagger-ui .api-docs-auth-card-heading { display: flex; align-items: center; gap: 10px; margin-bottom: 16px; font-size: 15px; font-weight: 650; color: #17243b; }
.swagger-ui .api-docs-auth-active { border-radius: 4px; padding: 3px 7px; background: #eff6ff; color: #2563eb; font-size: 10px; }
.swagger-ui .api-docs-auth-label { display: block; margin-bottom: 8px; font-size: 12px; color: #475569; }
.swagger-ui .api-docs-auth-field { display: flex; border: 1px solid #cbd5e1; border-radius: 6px; background: #fff; overflow: hidden; }
.swagger-ui .api-docs-auth-field input { width: 100%; min-width: 0; flex: 1; border: 0; margin: 0; padding: 11px 12px; font: 12px Consolas, monospace; background: transparent; }
.swagger-ui .api-docs-auth-reveal { flex: 0 0 auto; border: 0; border-left: 1px solid #e2e8f0; background: #f8fafc; padding: 0 12px; color: #475569; font-size: 11px; cursor: pointer; }
.swagger-ui .api-docs-auth-actions { display: flex; align-items: center; flex-wrap: wrap; gap: 10px; margin: 14px 0 10px; }
.swagger-ui .api-docs-auth-state { color: #64748b; font-size: 11px; margin-left: auto; }
.swagger-ui .api-docs-auth-refresh { font-size: 11px; color: #64748b; }
@media (max-width: 540px) { .swagger-ui .api-docs-dual-auth-ready .modal-ux-content { padding: 16px; } .swagger-ui .api-docs-auth-card { padding: 14px; } }
@media (max-width: 1200px) {
  .swagger-ui .scheme-container .auth-wrapper { margin-left: 0; }
  .swagger-ui .api-docs-language-panel { flex-wrap: wrap; }
}
@media (max-width: 900px) {
  .swagger-ui .api-docs-sidebar { display: none; }
  .swagger-ui > .swagger-ui { margin-left: 0; padding: 26px 22px 48px; }
  .swagger-ui .api-portal-hero { padding: 0 22px; gap: 10px; }
  .swagger-ui .api-portal-meta { display: none; }
  .swagger-ui .api-portal-brand { font-size: 16px; }
}
@media (max-width: 540px) {
  .swagger-ui .api-portal-hero { height: auto; min-height: 106px; flex-wrap: wrap; padding: 14px 18px; gap: 12px; }
  .swagger-ui .api-portal-tabs { flex-basis: 100%; margin-left: 0; }
  .swagger-ui .api-portal-tab { flex: 1; min-width: 0; }
  .swagger-ui > .swagger-ui { padding: 22px 18px 40px; }
  .swagger-ui .info .title { font-size: 26px; }
  .swagger-ui .info .description p { font-size: 13px; }
  .swagger-ui .scheme-container { padding: 12px; }
  .swagger-ui .scheme-container .schemes { gap: 12px; }
  .swagger-ui .scheme-container .servers { width: 100%; display: block; }
  .swagger-ui .servers > label { display: block; }
  .swagger-ui .servers-title { margin-bottom: 7px; }
  .swagger-ui .servers select { width: 100%; max-width: 100%; }
  .swagger-ui .api-docs-language-panel { gap: 10px; }
  .swagger-ui .api-docs-clear-session { font-size: 11px; }
  .swagger-ui .opblock .opblock-summary { padding: 10px; gap: 6px; min-height: 54px; }
  .swagger-ui .opblock .opblock-summary-method { min-width: 48px; font-size: 10px; padding: 5px 6px; }
  .swagger-ui .opblock .opblock-summary-path { font-size: 11px; }
  .swagger-ui .opblock .opblock-summary-description { display: none; }
  .swagger-ui .api-docs-access { font-size: 9px; padding: 3px 5px; }
  .swagger-ui .api-docs-overview { gap: 10px; }
  .swagger-ui .api-docs-overview span { font-size: 11px; }
  .swagger-ui .opblock-tag, .swagger-ui .opblock { scroll-margin-top: 126px; }
}
@media (prefers-reduced-motion: reduce) { html { scroll-behavior: auto; } }
`;
