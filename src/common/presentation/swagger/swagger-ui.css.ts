export const SWAGGER_UI_CUSTOM_CSS = `
  .swagger-ui .topbar {
    background-color: #222222;
    padding: 8px 0;
  }

  .swagger-ui .topbar .download-url-wrapper {
    display: none;
  }

  .swagger-ui .info .title {
    font-size: 2rem;
    font-weight: 700;
    color: #222222;
  }

  .swagger-ui .info .title small {
    background-color: #ff385c;
    border-radius: 4px;
    padding: 4px 8px;
  }

  .swagger-ui .info .description p {
    line-height: 1.6;
  }

  .swagger-ui .opblock-tag {
    font-size: 1.1rem;
    border-bottom: 1px solid #ebebeb;
    padding: 12px 0;
  }

  .swagger-ui .opblock.opblock-post {
    border-color: #ff385c;
    background: rgba(255, 56, 92, 0.05);
  }

  .swagger-ui .opblock.opblock-post .opblock-summary-method {
    background: #ff385c;
  }

  .swagger-ui .btn.authorize {
    border-color: #ff385c;
    color: #ff385c;
  }

  .swagger-ui .btn.authorize svg {
    fill: #ff385c;
  }

  .swagger-ui section.models {
    border: 1px solid #ebebeb;
    border-radius: 8px;
  }

  .swagger-ui .model-box {
    border-radius: 4px;
  }

  .swagger-ui .scheme-container {
    background: #f7f7f7;
    box-shadow: none;
    border-bottom: 1px solid #ebebeb;
    padding: 16px 0;
  }
`.trim();
