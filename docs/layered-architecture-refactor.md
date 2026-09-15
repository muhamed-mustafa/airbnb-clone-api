# Layered architecture refactor

## Inventory and placement decisions

Recorded before moving source files. Tests follow their implementation.

| Original file                                                                             | Target file                                                                        | Reason                                |
| ----------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------- | ------------------------------------- |
| `src/app.module.ts`                                                                       | `src/app/app.module.ts`                                                            | Root composition                      |
| `src/auth/auth.controller.spec.ts`                                                        | `src/presentation/auth/auth.controller.spec.ts`                                    | HTTP controller, DTO, or mapper       |
| `src/auth/auth.controller.ts`                                                             | `src/presentation/auth/auth.controller.ts`                                         | HTTP controller, DTO, or mapper       |
| `src/auth/auth.module.ts`                                                                 | `src/app/auth.module.ts`                                                           | Feature composition across layers     |
| `src/auth/auth.service.spec.ts`                                                           | `src/application/auth/services/auth.service.spec.ts`                               | Application logic, model, or contract |
| `src/auth/auth.service.ts`                                                                | `src/application/auth/services/auth.service.ts`                                    | Application logic, model, or contract |
| `src/auth/entities/refresh-token.entity.ts`                                               | `src/application/auth/entities/refresh-token.entity.ts`                            | Application logic, model, or contract |
| `src/auth/infrastructure/services/argon2-secret-hash.service.ts`                          | `src/infrastructure/auth/services/argon2-secret-hash.service.ts`                   | Technical implementation              |
| `src/auth/infrastructure/services/jwt-token-service.ts`                                   | `src/infrastructure/auth/services/jwt-token-service.ts`                            | Technical implementation              |
| `src/auth/inputs/login.input.ts`                                                          | `src/application/auth/inputs/login.input.ts`                                       | Application logic, model, or contract |
| `src/auth/inputs/refresh-token.input.ts`                                                  | `src/application/auth/inputs/refresh-token.input.ts`                               | Application logic, model, or contract |
| `src/auth/inputs/register.input.ts`                                                       | `src/application/auth/inputs/register.input.ts`                                    | Application logic, model, or contract |
| `src/auth/mappers/auth.mapper.ts`                                                         | `src/presentation/auth/mappers/auth.mapper.ts`                                     | HTTP controller, DTO, or mapper       |
| `src/auth/outputs/login.output.ts`                                                        | `src/application/auth/outputs/login.output.ts`                                     | Application logic, model, or contract |
| `src/auth/outputs/refresh-token.output.ts`                                                | `src/application/auth/outputs/refresh-token.output.ts`                             | Application logic, model, or contract |
| `src/auth/outputs/register.output.ts`                                                     | `src/application/auth/outputs/register.output.ts`                                  | Application logic, model, or contract |
| `src/auth/presentation/dtos/auth-response.dto.ts`                                         | `src/presentation/auth/dtos/auth-response.dto.ts`                                  | HTTP controller, DTO, or mapper       |
| `src/auth/presentation/dtos/login.dto.ts`                                                 | `src/presentation/auth/dtos/login.dto.ts`                                          | HTTP controller, DTO, or mapper       |
| `src/auth/presentation/dtos/refresh-token.dto.ts`                                         | `src/presentation/auth/dtos/refresh-token.dto.ts`                                  | HTTP controller, DTO, or mapper       |
| `src/auth/presentation/dtos/register.dto.ts`                                              | `src/presentation/auth/dtos/register.dto.ts`                                       | HTTP controller, DTO, or mapper       |
| `src/auth/repositories/mongoose-refresh-token.repository.spec.ts`                         | `src/infrastructure/auth/repositories/mongoose-refresh-token.repository.spec.ts`   | Technical implementation              |
| `src/auth/repositories/mongoose-refresh-token.repository.ts`                              | `src/infrastructure/auth/repositories/mongoose-refresh-token.repository.ts`        | Technical implementation              |
| `src/auth/repositories/refresh-token-repository.token.ts`                                 | `src/application/auth/repositories/refresh-token-repository.token.ts`              | Application logic, model, or contract |
| `src/auth/repositories/refresh-token.repository.ts`                                       | `src/application/auth/repositories/refresh-token.repository.ts`                    | Application logic, model, or contract |
| `src/auth/schemas/refresh-token.schema.ts`                                                | `src/infrastructure/auth/schemas/refresh-token.schema.ts`                          | Technical implementation              |
| `src/auth/services/secret-hash-service.token.ts`                                          | `src/application/auth/services/secret-hash-service.token.ts`                       | Application logic, model, or contract |
| `src/auth/services/secret-hash.service.ts`                                                | `src/application/auth/services/secret-hash.service.ts`                             | Application logic, model, or contract |
| `src/auth/services/token-service.token.ts`                                                | `src/application/auth/services/token-service.token.ts`                             | Application logic, model, or contract |
| `src/auth/services/token.service.ts`                                                      | `src/application/auth/services/token.service.ts`                                   | Application logic, model, or contract |
| `src/auth/use-cases/generate-token.usecase.spec.ts`                                       | `src/application/auth/use-cases/generate-token.usecase.spec.ts`                    | Application logic, model, or contract |
| `src/auth/use-cases/generate-token.usecase.ts`                                            | `src/application/auth/use-cases/generate-token.usecase.ts`                         | Application logic, model, or contract |
| `src/auth/use-cases/login.usecase.ts`                                                     | `src/application/auth/use-cases/login.usecase.ts`                                  | Application logic, model, or contract |
| `src/auth/use-cases/refresh-token.usecase.spec.ts`                                        | `src/application/auth/use-cases/refresh-token.usecase.spec.ts`                     | Application logic, model, or contract |
| `src/auth/use-cases/refresh-token.usecase.ts`                                             | `src/application/auth/use-cases/refresh-token.usecase.ts`                          | Application logic, model, or contract |
| `src/auth/use-cases/register.usecase.ts`                                                  | `src/application/auth/use-cases/register.usecase.ts`                               | Application logic, model, or contract |
| `src/common/config/env.mapper.ts`                                                         | `src/common/config/env.mapper.ts`                                                  | Already correctly placed              |
| `src/common/config/env.schema.ts`                                                         | `src/common/config/env.schema.ts`                                                  | Already correctly placed              |
| `src/common/config/env.types.ts`                                                          | `src/common/config/env.types.ts`                                                   | Already correctly placed              |
| `src/common/config/environments/base.env.ts`                                              | `src/common/config/environments/base.env.ts`                                       | Already correctly placed              |
| `src/common/database/is-duplicate-key-error.ts`                                           | `src/infrastructure/database/is-duplicate-key-error.ts`                            | Database helper                       |
| `src/common/errors/application.error.ts`                                                  | `src/common/errors/application.error.ts`                                           | Already correctly placed              |
| `src/common/errors-handling/constants/http-error-codes.ts`                                | `src/presentation/errors/constants/http-error-codes.ts`                            | HTTP error formatting                 |
| `src/common/errors-handling/error-codes.ts`                                               | `src/common/errors/error-codes.ts`                                                 | Shared semantic codes                 |
| `src/common/errors-handling/error-response.interface.ts`                                  | `src/presentation/errors/error-response.interface.ts`                              | HTTP error formatting                 |
| `src/common/errors-handling/filters/global-exception-filter.ts`                           | `src/presentation/filters/global-exception-filter.ts`                              | HTTP exception filter                 |
| `src/common/errors-handling/filters/http-exception.filter.ts`                             | `src/presentation/filters/http-exception.filter.ts`                                | HTTP exception filter                 |
| `src/common/errors-handling/filters/validation-exception.filter.ts`                       | `src/presentation/filters/validation-exception.filter.ts`                          | HTTP exception filter                 |
| `src/common/errors-handling/input-validation/format-input-validation-errors.ts`           | `src/presentation/errors/input-validation/format-input-validation-errors.ts`       | HTTP error formatting                 |
| `src/common/logging/logger.token.ts`                                                      | `src/common/logging/logger.token.ts`                                               | Already correctly placed              |
| `src/common/logging/logger.ts`                                                            | `src/common/logging/logger.ts`                                                     | Already correctly placed              |
| `src/common/presentation/errors/application-error-status.map.ts`                          | `src/presentation/errors/application-error-status.map.ts`                          | HTTP presentation                     |
| `src/common/presentation/filters/application-exception.filter.ts`                         | `src/presentation/filters/application-exception.filter.ts`                         | HTTP presentation                     |
| `src/common/presentation/middleware/request-context/request-context.middleware.ts`        | `src/presentation/middleware/request-context/request-context.middleware.ts`        | HTTP presentation                     |
| `src/common/presentation/swagger/decorators/api-application-error-responses.decorator.ts` | `src/presentation/swagger/decorators/api-application-error-responses.decorator.ts` | HTTP presentation                     |
| `src/common/presentation/swagger/decorators/api-conflict-error-response.decorator.ts`     | `src/presentation/swagger/decorators/api-conflict-error-response.decorator.ts`     | HTTP presentation                     |
| `src/common/presentation/swagger/decorators/api-internal-error-response.decorator.ts`     | `src/presentation/swagger/decorators/api-internal-error-response.decorator.ts`     | HTTP presentation                     |
| `src/common/presentation/swagger/decorators/api-register-error-responses.decorator.ts`    | `src/presentation/swagger/decorators/api-register-error-responses.decorator.ts`    | HTTP presentation                     |
| `src/common/presentation/swagger/decorators/api-validation-error-response.decorator.ts`   | `src/presentation/swagger/decorators/api-validation-error-response.decorator.ts`   | HTTP presentation                     |
| `src/common/presentation/swagger/decorators/auth/api-login-docs.decorator.ts`             | `src/presentation/swagger/decorators/auth/api-login-docs.decorator.ts`             | HTTP presentation                     |
| `src/common/presentation/swagger/decorators/auth/api-refresh-token-docs.decorator.ts`     | `src/presentation/swagger/decorators/auth/api-refresh-token-docs.decorator.ts`     | HTTP presentation                     |
| `src/common/presentation/swagger/decorators/auth/api-register-docs.decorator.ts`          | `src/presentation/swagger/decorators/auth/api-register-docs.decorator.ts`          | HTTP presentation                     |
| `src/common/presentation/swagger/decorators/users/api-create-user-docs.decorator.ts`      | `src/presentation/swagger/decorators/users/api-create-user-docs.decorator.ts`      | HTTP presentation                     |
| `src/common/presentation/swagger/dtos/application-error-response.dto.ts`                  | `src/presentation/swagger/dtos/application-error-response.dto.ts`                  | HTTP presentation                     |
| `src/common/presentation/swagger/dtos/http-error-item.dto.ts`                             | `src/presentation/swagger/dtos/http-error-item.dto.ts`                             | HTTP presentation                     |
| `src/common/presentation/swagger/dtos/http-errors-response.dto.ts`                        | `src/presentation/swagger/dtos/http-errors-response.dto.ts`                        | HTTP presentation                     |
| `src/common/presentation/swagger/dtos/internal-error-item.dto.ts`                         | `src/presentation/swagger/dtos/internal-error-item.dto.ts`                         | HTTP presentation                     |
| `src/common/presentation/swagger/dtos/internal-error-response.dto.ts`                     | `src/presentation/swagger/dtos/internal-error-response.dto.ts`                     | HTTP presentation                     |
| `src/common/presentation/swagger/dtos/validation-error-item.dto.ts`                       | `src/presentation/swagger/dtos/validation-error-item.dto.ts`                       | HTTP presentation                     |
| `src/common/presentation/swagger/dtos/validation-errors-response.dto.ts`                  | `src/presentation/swagger/dtos/validation-errors-response.dto.ts`                  | HTTP presentation                     |
| `src/common/presentation/swagger/examples/validation.examples.ts`                         | `src/presentation/swagger/examples/validation.examples.ts`                         | HTTP presentation                     |
| `src/common/presentation/swagger/swagger-ui.css.ts`                                       | `src/presentation/swagger/swagger-ui.css.ts`                                       | HTTP presentation                     |
| `src/common/presentation/swagger/swagger-ui.script.spec.ts`                               | `src/presentation/swagger/swagger-ui.script.spec.ts`                               | HTTP presentation                     |
| `src/common/presentation/swagger/swagger-ui.script.ts`                                    | `src/presentation/swagger/swagger-ui.script.ts`                                    | HTTP presentation                     |
| `src/common/presentation/swagger/swagger.config.ts`                                       | `src/presentation/swagger/swagger.config.ts`                                       | HTTP presentation                     |
| `src/common/presentation/swagger/swagger.constants.ts`                                    | `src/presentation/swagger/swagger.constants.ts`                                    | HTTP presentation                     |
| `src/common/presentation/swagger/swagger.setup.ts`                                        | `src/presentation/swagger/swagger.setup.ts`                                        | HTTP presentation                     |
| `src/common/request-context/request-context.module.ts`                                    | `src/common/request-context/request-context.module.ts`                             | Already correctly placed              |
| `src/common/request-context/request-context.ts`                                           | `src/common/request-context/request-context.ts`                                    | Already correctly placed              |
| `src/common/utils/phone.util.ts`                                                          | `src/common/utils/phone.util.ts`                                                   | Already correctly placed              |
| `src/common/utils/to-error.ts`                                                            | `src/common/utils/to-error.ts`                                                     | Already correctly placed              |
| `src/common/utils/transformers.util.ts`                                                   | `src/presentation/utils/transformers.util.ts`                                      | DTO transformation                    |
| `src/common/validators/is-required-string.decorator.ts`                                   | `src/presentation/validators/is-required-string.decorator.ts`                      | Request validation                    |
| `src/core.module.ts`                                                                      | `src/app/core.module.ts`                                                           | Root composition                      |
| `src/i18n/ar/auth.json`                                                                   | `src/common/i18n/ar/auth.json`                                                     | Shared translation assets             |
| `src/i18n/ar/errors.json`                                                                 | `src/common/i18n/ar/errors.json`                                                   | Shared translation assets             |
| `src/i18n/ar/validation.json`                                                             | `src/common/i18n/ar/validation.json`                                               | Shared translation assets             |
| `src/i18n/en/auth.json`                                                                   | `src/common/i18n/en/auth.json`                                                     | Shared translation assets             |
| `src/i18n/en/errors.json`                                                                 | `src/common/i18n/en/errors.json`                                                   | Shared translation assets             |
| `src/i18n/en/validation.json`                                                             | `src/common/i18n/en/validation.json`                                               | Shared translation assets             |
| `src/infrastructure/logging/logging.module.ts`                                            | `src/infrastructure/logging/logging.module.ts`                                     | Already correctly placed              |
| `src/infrastructure/logging/pino-logger.service.spec.ts`                                  | `src/infrastructure/logging/pino-logger.service.spec.ts`                           | Already correctly placed              |
| `src/infrastructure/logging/pino-logger.service.ts`                                       | `src/infrastructure/logging/pino-logger.service.ts`                                | Already correctly placed              |
| `src/main.ts`                                                                             | `src/main.ts`                                                                      | Already correctly placed              |
| `src/users/dtos/create-user.dto.ts`                                                       | `src/presentation/users/dtos/create-user.dto.ts`                                   | HTTP controller, DTO, or mapper       |
| `src/users/dtos/user-response.dto.ts`                                                     | `src/presentation/users/dtos/user-response.dto.ts`                                 | HTTP controller, DTO, or mapper       |
| `src/users/entities/user.entity.ts`                                                       | `src/application/users/entities/user.entity.ts`                                    | Application logic, model, or contract |
| `src/users/inputs/create-user.input.ts`                                                   | `src/application/users/inputs/create-user.input.ts`                                | Application logic, model, or contract |
| `src/users/mappers/user.mapper.ts`                                                        | `src/presentation/users/mappers/user.mapper.ts`                                    | HTTP controller, DTO, or mapper       |
| `src/users/repositories/mongoose-users.repository.ts`                                     | `src/infrastructure/users/repositories/mongoose-users.repository.ts`               | Technical implementation              |
| `src/users/repositories/user-filter.ts`                                                   | `src/application/users/repositories/user-filter.ts`                                | Application logic, model, or contract |
| `src/users/repositories/user-repository.token.ts`                                         | `src/application/users/repositories/user-repository.token.ts`                      | Application logic, model, or contract |
| `src/users/repositories/users.repository.ts`                                              | `src/application/users/repositories/users.repository.ts`                           | Application logic, model, or contract |
| `src/users/schemas/user.schema.ts`                                                        | `src/infrastructure/users/schemas/user.schema.ts`                                  | Technical implementation              |
| `src/users/users.controller.spec.ts`                                                      | `src/presentation/users/users.controller.spec.ts`                                  | HTTP controller, DTO, or mapper       |
| `src/users/users.controller.ts`                                                           | `src/presentation/users/users.controller.ts`                                       | HTTP controller, DTO, or mapper       |
| `src/users/users.module.ts`                                                               | `src/app/users.module.ts`                                                          | Feature composition across layers     |
| `src/users/users.service.spec.ts`                                                         | `src/application/users/services/users.service.spec.ts`                             | Application logic, model, or contract |
| `src/users/users.service.ts`                                                              | `src/application/users/services/users.service.ts`                                  | Application logic, model, or contract |

## Final source tree

```text
src/
├── app/
│   ├── app.module.ts
│   ├── auth.module.ts
│   ├── core.module.ts
│   └── users.module.ts
├── application/
│   ├── auth/
│   │   ├── entities/
│   │   │   └── refresh-token.entity.ts
│   │   ├── inputs/
│   │   │   ├── login.input.ts
│   │   │   ├── refresh-token.input.ts
│   │   │   └── register.input.ts
│   │   ├── outputs/
│   │   │   ├── login.output.ts
│   │   │   ├── refresh-token.output.ts
│   │   │   └── register.output.ts
│   │   ├── repositories/
│   │   │   ├── refresh-token-repository.token.ts
│   │   │   └── refresh-token.repository.ts
│   │   ├── services/
│   │   │   ├── auth.service.spec.ts
│   │   │   ├── auth.service.ts
│   │   │   ├── secret-hash-service.token.ts
│   │   │   ├── secret-hash.service.ts
│   │   │   ├── token-service.token.ts
│   │   │   └── token.service.ts
│   │   └── use-cases/
│   │       ├── generate-token.usecase.spec.ts
│   │       ├── generate-token.usecase.ts
│   │       ├── login.usecase.ts
│   │       ├── refresh-token.usecase.spec.ts
│   │       ├── refresh-token.usecase.ts
│   │       └── register.usecase.ts
│   └── users/
│       ├── entities/
│       │   └── user.entity.ts
│       ├── inputs/
│       │   └── create-user.input.ts
│       ├── repositories/
│       │   ├── user-filter.ts
│       │   ├── user-repository.token.ts
│       │   └── users.repository.ts
│       └── services/
│           ├── users.service.spec.ts
│           └── users.service.ts
├── common/
│   ├── config/
│   │   ├── environments/
│   │   │   └── base.env.ts
│   │   ├── env.mapper.ts
│   │   ├── env.schema.ts
│   │   └── env.types.ts
│   ├── errors/
│   │   ├── application.error.ts
│   │   └── error-codes.ts
│   ├── i18n/
│   │   ├── ar/
│   │   │   ├── auth.json
│   │   │   ├── errors.json
│   │   │   └── validation.json
│   │   └── en/
│   │       ├── auth.json
│   │       ├── errors.json
│   │       └── validation.json
│   ├── logging/
│   │   ├── logger.token.ts
│   │   └── logger.ts
│   ├── request-context/
│   │   ├── request-context.module.ts
│   │   └── request-context.ts
│   └── utils/
│       ├── phone.util.ts
│       └── to-error.ts
├── infrastructure/
│   ├── auth/
│   │   ├── repositories/
│   │   │   ├── mongoose-refresh-token.repository.spec.ts
│   │   │   └── mongoose-refresh-token.repository.ts
│   │   ├── schemas/
│   │   │   └── refresh-token.schema.ts
│   │   └── services/
│   │       ├── argon2-secret-hash.service.ts
│   │       └── jwt-token-service.ts
│   ├── database/
│   │   └── is-duplicate-key-error.ts
│   ├── logging/
│   │   ├── logging.module.ts
│   │   ├── pino-logger.service.spec.ts
│   │   └── pino-logger.service.ts
│   └── users/
│       ├── mappers/
│       │   └── user.mapper.ts
│       ├── repositories/
│       │   └── mongoose-users.repository.ts
│       └── schemas/
│           └── user.schema.ts
├── presentation/
│   ├── auth/
│   │   ├── dtos/
│   │   │   ├── auth-response.dto.ts
│   │   │   ├── login.dto.ts
│   │   │   ├── refresh-token.dto.ts
│   │   │   └── register.dto.ts
│   │   ├── mappers/
│   │   │   └── auth.mapper.ts
│   │   ├── auth.controller.spec.ts
│   │   └── auth.controller.ts
│   ├── errors/
│   │   ├── constants/
│   │   │   └── http-error-codes.ts
│   │   ├── input-validation/
│   │   │   └── format-input-validation-errors.ts
│   │   ├── application-error-status.map.ts
│   │   └── error-response.interface.ts
│   ├── filters/
│   │   ├── application-exception.filter.ts
│   │   ├── global-exception-filter.ts
│   │   ├── http-exception.filter.ts
│   │   └── validation-exception.filter.ts
│   ├── middleware/
│   │   └── request-context/
│   │       └── request-context.middleware.ts
│   ├── swagger/
│   │   ├── decorators/
│   │   │   ├── auth/
│   │   │   │   ├── api-login-docs.decorator.ts
│   │   │   │   ├── api-refresh-token-docs.decorator.ts
│   │   │   │   └── api-register-docs.decorator.ts
│   │   │   ├── users/
│   │   │   │   └── api-create-user-docs.decorator.ts
│   │   │   ├── api-application-error-responses.decorator.ts
│   │   │   ├── api-conflict-error-response.decorator.ts
│   │   │   ├── api-internal-error-response.decorator.ts
│   │   │   ├── api-register-error-responses.decorator.ts
│   │   │   └── api-validation-error-response.decorator.ts
│   │   ├── dtos/
│   │   │   ├── application-error-response.dto.ts
│   │   │   ├── http-error-item.dto.ts
│   │   │   ├── http-errors-response.dto.ts
│   │   │   ├── internal-error-item.dto.ts
│   │   │   ├── internal-error-response.dto.ts
│   │   │   ├── validation-error-item.dto.ts
│   │   │   └── validation-errors-response.dto.ts
│   │   ├── examples/
│   │   │   └── validation.examples.ts
│   │   ├── swagger-ui.css.ts
│   │   ├── swagger-ui.script.spec.ts
│   │   ├── swagger-ui.script.ts
│   │   ├── swagger.config.ts
│   │   ├── swagger.constants.ts
│   │   └── swagger.setup.ts
│   ├── users/
│   │   ├── dtos/
│   │   │   ├── create-user.dto.ts
│   │   │   └── user-response.dto.ts
│   │   ├── mappers/
│   │   │   └── user.mapper.ts
│   │   ├── users.controller.spec.ts
│   │   └── users.controller.ts
│   ├── utils/
│   │   └── transformers.util.ts
│   └── validators/
│       └── is-required-string.decorator.ts
└── main.ts
```

## Architectural decisions

- `app/` owns the existing root and feature composition modules; provider tokens, module exports, filter order, and schema registrations are preserved.
- Presentation owns controllers, validation DTOs/decorators/transformers, HTTP mappers, filters, middleware, Swagger, and HTTP error formatting.
- Application owns existing use cases, facades, plain models, and repository/token/hash contracts. Existing Nest injection decorators remain; no infrastructure or presentation dependencies are introduced.
- Infrastructure owns Mongoose repositories/schemas, JWT/Argon2, Pino, and the duplicate-key helper. The added `src/infrastructure/users/mappers/user.mapper.ts` copies the exact existing five fields into `UserEntity`, removing the repository's dependency on the HTTP mapper. The existing presentation mapper and public behavior are preserved.
- Common retains config, framework-independent application errors, shared error codes, logger contracts, request context, phone/error utilities, and translations. `CoreModule` and Nest asset configuration point to `common/i18n`.
- Existing file/class names are preserved. Tests follow their implementations. No empty placeholder layers, barrels, or additional Nest modules were introduced.

## Behavior

No API/business behavior was intentionally changed.

The existing refresh route is `POST /api/auth/refresh-token`. `POST /api/auth/refresh` remains 404; adding or renaming it would change the API contract.

## Verification results

All six checks passed after each phase (2 through 6). The final `pnpm check` also passed with the previous `dist/` archived, producing a fresh build:

| Check               | Final result                                |
| ------------------- | ------------------------------------------- |
| `pnpm format:check` | Passed; all TypeScript files match Prettier |
| `pnpm lint`         | Passed                                      |
| `pnpm typecheck`    | Passed                                      |
| `pnpm test`         | 9 suites passed; 16 tests passed            |
| `pnpm test:e2e`     | 1 suite passed; 1 test passed               |
| `pnpm build`        | Passed from a clean output directory        |
| `pnpm check`        | Exit code 0                                 |

Additional checks against the compiled application used a uniquely named local MongoDB database and removed only that test database afterward:

- `GET /api/docs` and `GET /api/docs-json`: 200; existing OpenAPI operation IDs preserved.
- Register and login: 201 with the existing access/refresh token response shape.
- `POST /api/auth/refresh-token`: 201; rotation works, the previous token is rejected with 401, and the new token works. The test waits across a JWT timestamp second before rotation to avoid identical issuance timestamps.
- `POST /api/auth/refresh`: 404, preserving the existing route contract.
- English and Arabic validation errors: 400 with existing codes, fields, and localized messages.
- English and Arabic invalid credentials and malformed refresh tokens: 401 with existing application error codes and localized messages.
- Unknown route: 404; duplicate registration: 409.
- `POST /api/users`: 201 with the existing five response fields, including password. Existing serialization behavior was preserved.
- Supplied and generated request IDs are present in responses; Pino registration and invalid-token logs carry their matching request IDs.
- All six translation JSON files are copied byte-for-byte to `dist/common/i18n/`. OpenAPI and localized response snapshots match those captured before the asset move.
- All 108 original source files retain identical non-import TypeScript syntax or translation content, normalizing line endings, except the required i18n loader path adjustment. The infrastructure mapper adds the same existing field projection.
- Manual import inspection found no application-to-infrastructure/presentation dependencies and no infrastructure-to-presentation dependencies. `git diff --check` passed.

The existing checked-in e2e suite remains a one-test bootstrap check; the additional HTTP verification above was run separately using a temporary smoke script. This refactor moves 93 existing files and adds one infrastructure mapper. Documentation links were updated to the resulting structure.
