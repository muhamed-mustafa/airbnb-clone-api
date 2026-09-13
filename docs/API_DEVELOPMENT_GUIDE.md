# API Development Guide

This document is the source of truth for AI coding agents when adding or modifying API endpoints in this repository.

## 1. Purpose

Read this guide before endpoint work, then inspect the closest existing implementation. Follow repository patterns over generic NestJS assumptions. The architecture is organized by feature, with logical boundaries that are not always separate directories. Preserve established behavior; where this guide identifies a gap, do not silently turn it into a new convention or fix it outside the requested scope. Update this guide when an intentional architectural change makes it inaccurate.

## 2. Architecture

The current request flow is:

```text
Controller -> Mapper -> Feature service -> Use case (auth) -> Abstractions
                                                               ^
                                                     Infrastructure implements
```

| Responsibility | Current locations and boundaries                                                                                                                                   |
| -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Presentation   | Controllers, request/response DTOs, HTTP mapping, Swagger, exception filters. Controllers call feature services.                                                   |
| Application    | Auth use cases, feature services, plain input/output interfaces and entities. Express business behavior through repository, token and hashing abstractions.        |
| Abstractions   | Feature `repositories/` interfaces and tokens; auth `services/` interfaces and tokens. Expose application types, not Mongoose queries/documents.                   |
| Infrastructure | Mongoose repositories and schemas; JWT and Argon2 adapters in auth `infrastructure/services/`. Own persistence, signing, hashing and infrastructure configuration. |
| Composition    | Feature modules bind tokens with `useClass`; `CoreModule` configures environment, Mongoose and i18n; `AppModule` registers global filters.                         |

See [AuthModule](../src/auth/auth.module.ts), [UsersModule](../src/users/users.module.ts), [CoreModule](../src/core.module.ts) and [AppModule](../src/app.module.ts).

Application code uses Nest `@Injectable()` and `@Inject()`; it is not framework-free. Keep Mongoose models/operators, concrete repositories, `JwtService`, `ConfigService`, Argon2 calls, HTTP exceptions, DTO validation and Swagger metadata out of use cases. Use the existing interfaces instead. Module configuration may depend on infrastructure.

Two existing exceptions matter: Mongoose repository implementations live beside their interfaces in `repositories/`, and the users repository reuses `UserMapper`, which also handles presentation DTOs. Do not relocate these files as part of ordinary endpoint work. `UsersService` delegates directly to its repository; there is no users use-case directory or output interface layer to imitate.

## 3. Endpoint Implementation Workflow

1. Inspect the nearest controller, mapper, service/use case, DTO, documentation decorator and tests. Establish the route, success status, response fields, error cases and authentication requirement.
2. Define or update plain application input/output interfaces. Reuse entities where the feature already returns them.
3. Define the smallest required repository/service capability and its token if an existing abstraction cannot express the operation.
4. Implement application behavior, then the infrastructure capability. Register providers and module imports/exports.
5. Add request/response DTOs, validation, transformations and any English/Arabic translation keys. Update mapping explicitly.
6. Add a thin controller method and one semantic Swagger decorator with stable ID, ordering and accurate responses.
7. Add behavior tests at the relevant boundaries and HTTP contract tests when appropriate.
8. Run the checks in section 15 and inspect Swagger and the actual response. Report any mismatch or unavailable verification.

## 4. Controllers

[AuthController](../src/auth/auth.controller.ts) and [UsersController](../src/users/users.controller.ts) are the only current controllers. All four endpoints are POSTs and use Nest's default 201 success status. [Bootstrap](../src/main.ts) adds the `/api` prefix.

Controllers receive DTOs with `@Body()`, map them to application inputs, call the feature service, and map the result to a response DTO shape. Keep business rules, hashing, token work and database logic outside controllers. Do not inject repositories into controllers. Preserve class-level `@ApiTags(SWAGGER_TAGS.AUTH)` or `SWAGGER_TAGS.USERS`; operation documentation belongs in the endpoint composite decorator.

## 5. DTOs

Auth request and response classes live in [auth presentation DTOs](../src/auth/presentation/dtos/); users classes live in [users DTOs](../src/users/dtos/). Follow the feature's existing location. These are presentation contracts; application inputs/outputs are separate interfaces.

- Keep property descriptions, examples, formats, length bounds and flags such as `writeOnly` in `@ApiProperty()` on DTO properties. Swagger metadata does not enforce validation.
- Reuse [IsRequiredString](../src/common/validators/is-required-string.decorator.ts) for required strings: it composes `IsNotEmpty`, `IsString`, and optional `MinLength`/`MaxLength` with i18n messages.
- Use `class-validator` for request shape constraints. Register and create-user email validation use `i18nValidationMessage('validation.isEmail')`.
- Reuse [transformers](../src/common/utils/transformers.util.ts) via `@Transform`: `trimString` trims strings; `normalizeEmail` trims and lowercases them. Neither changes non-string values.
- Transformations are field-specific. Registration normalizes email and does not trim password; create-user trims email and password; login and refresh DTOs have no transforms. Do not assume every email is lowercased or every string trimmed.

Response mapping is explicit in [AuthMapper](../src/auth/mappers/auth.mapper.ts) and [UserMapper](../src/users/mappers/user.mapper.ts). **Existing serialization gap:** `UserResponseDto` marks password with `@Exclude()`, but `UserMapper.toResponse()` returns a plain object containing password, and bootstrap installs no `ClassSerializerInterceptor`. Do not assume the decorator removes that field from runtime responses. Verify actual output and address any fix within an explicitly scoped change. Similarly, direct user creation does not perform the password hashing implemented by registration.

## 6. Application Layer

[AuthService](../src/auth/auth.service.ts) delegates to `RegisterUseCase`, `LoginUseCase` and `RefreshTokenUseCase`. Their `execute(input)` methods consume interfaces in [inputs](../src/auth/inputs/) and return interfaces in [outputs](../src/auth/outputs/). `GenerateTokenUseCase` shares token issuance and rotation behavior. [UsersService](../src/users/users.service.ts) consumes `CreateUserInput`/`UserFilter` and returns `UserEntity` or `null` for a missing lookup.

Auth use cases consume `UsersService`, `RefreshTokenRepository`, `TokenService` and `SecretHashService`. Symbol tokens are `REFRESH_TOKEN_REPOSITORY`, `TOKEN_SERVICE_TOKEN`, `SECRET_HASH_SERVICE_TOKEN` and, in users, `USER_REPOSITORY_TOKEN`. Inject interface dependencies with `@Inject(TOKEN)` and type-only interface imports where appropriate. Bind adapters in the module, not in a controller or use case.

Application expresses what happens: registration validates a phone through [parseAndValidatePhone](../src/common/utils/phone.util.ts), hashes the password through `SecretHashService`, creates a user and issues tokens. Infrastructure determines how hashing, signing and persistence work. Do not add a use-case class solely to wrap an existing one-line service delegation.

## 7. Repository Boundary

| Contract                                                                                                         | Token                                                                                  | Implementation                                                                                  |
| ---------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| [UserRepository](../src/users/repositories/users.repository.ts): `create`, `findOne`                             | [USER_REPOSITORY_TOKEN](../src/users/repositories/user-repository.token.ts)            | [MongooseUsersRepository](../src/users/repositories/mongoose-users.repository.ts)               |
| [RefreshTokenRepository](../src/auth/repositories/refresh-token.repository.ts): `findByUserId`, `save`, `rotate` | [REFRESH_TOKEN_REPOSITORY](../src/auth/repositories/refresh-token-repository.token.ts) | [MongooseRefreshTokenRepository](../src/auth/repositories/mongoose-refresh-token.repository.ts) |

Add a method only when application behavior needs a capability absent from the contract. Keep its interface and token in the feature's `repositories/`; implement persistence in its Mongoose repository and register any new binding in the feature module. Application callers must not receive `Model`, `Document`, Mongo operators or query builders.

`rotate(userId, oldTokenHash, newTokenHash): Promise<boolean>` is an important example: infrastructure uses a single conditional `findOneAndUpdate` matching both user and old hash. Application converts `false` into `ApplicationError('INVALID_TOKEN')`. Preserve this conditional update; a separate read followed by an unconditional write loses the concurrency protection. `save` upserts the stored token hash.

The users repository currently throws `ConflictException` with `auth.USER_ALREADY_EXISTS` and `email`/`phone`, both after a pre-check and for duplicate-key failures. This is an existing infrastructure/HTTP coupling, not a pattern for application use cases.

## 8. Error Handling

[AppModule](../src/app.module.ts) registers four `APP_FILTER` providers. Preserve their wiring and these distinct contracts:

| Error / filter                                                                                                                                                   | HTTP status and JSON shape                                                                                                                   |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| [ApplicationError](../src/common/errors/application.error.ts) / [ApplicationExceptionFilter](../src/common/presentation/filters/application-exception.filter.ts) | `INVALID_TOKEN` and `INVALID_CREDENTIALS`: 401; `INVALID_PHONE_NUMBER`: 400. Body: `{ "code": "INVALID_TOKEN", "message": "..." }`.          |
| [HttpExceptionFilter](../src/common/errors-handling/filters/http-exception.filter.ts)                                                                            | Preserves exception status; `{ "errors": [{ "code": "auth.USER_ALREADY_EXISTS", "message": "...", "field": "email" }] }`; field is optional. |
| [ValidationExceptionFilter](../src/common/errors-handling/filters/validation-exception.filter.ts)                                                                | 400; `{ "errors": [{ "code": "isEmail", "field": "email", "message": "..." }] }`.                                                            |
| [GlobalExceptionFilter](../src/common/errors-handling/filters/global-exception-filter.ts)                                                                        | Logs unexpected errors; 500 with `{ "errors": [{ "message": "..." }] }`.                                                                     |

`code` is a stable machine identifier; `message` is display text that may vary with translation; `field` identifies the affected input property where supported. Do not standardize these different envelopes during endpoint work.

Application codes are unprefixed union members. Their [status/message maps](../src/common/presentation/errors/application-error-status.map.ts) map to HTTP status and translation keys such as `auth.INVALID_TOKEN`. HTTP [ERROR_CODES](../src/common/errors-handling/error-codes.ts) include namespaced identifiers such as `auth.USER_ALREADY_EXISTS`; [HTTP_ERROR_CODES](../src/common/errors-handling/constants/http-error-codes.ts) supplies defaults such as `errors.NOT_FOUND`. These identifiers and translation keys are not interchangeable.

For a new application failure, extend the union, both maps, translations and Swagger response documentation together. Keep HTTP status selection in presentation. Do not add ad hoc response construction to controllers.

## 9. Validation & i18n

[main.ts](../src/main.ts) installs `I18nValidationPipe` with `whitelist: true`, `transform: true`, and `forbidNonWhitelisted: true`. Unknown request fields are rejected. DTO decorators handle input constraints; application rules such as phone validity and token type belong in use cases.

[CoreModule](../src/core.module.ts) registers `AcceptLanguageResolver` and an English fallback, loading [English translations](../src/i18n/en/) and [Arabic translations](../src/i18n/ar/). Bootstrap also installs `I18nMiddleware`. Add corresponding keys in both languages; reuse `validation.isNotEmpty`, `validation.isString`, `validation.isEmail`, `validation.minLength` and `validation.maxLength` as appropriate. The configured i18n fallback is literally `en`, despite the separate environment field named `FALLBACK_LANGUAGE`.

Verify localization at the HTTP boundary rather than assuming it:

- [formatInputValidationErrors](../src/common/errors-handling/input-validation/format-input-validation-errors.ts) copies top-level constraint keys and messages into `{ code, field, message }`; it does not translate messages or recurse into child errors. Constraint codes are `isEmail`/`minLength`, not `validation.isEmail`/`validation.minLength`.
- `IsRequiredString` and registration/create-user email validators use i18n message helpers. Login/refresh validators use default messages. The custom validation filter does not explicitly translate helper output; test the actual message before claiming localized prose.
- The HTTP filter uses request `I18nContext`. The application filter calls `I18nService.translate` without an explicit language. Test both `Accept-Language: en` and `ar` for any localized contract.
- The catch-all filter requests `errors.internal_server_error`, while translation files contain `INTERNAL_SERVER_ERROR`. This existing mismatch must not be documented as guaranteed localized output.

## 10. Swagger / OpenAPI

Use **one semantic operation documentation decorator per endpoint**, implemented with plain `applyDecorators()`. Existing files live under [Swagger decorators](../src/common/presentation/swagger/decorators/) in `auth/` and `users/`. Name new ones `Api<Operation>Docs` in `api-<operation>-docs.decorator.ts`; follow `ApiRegisterDocs`, `ApiLoginDocs`, `ApiRefreshTokenDocs` and `ApiCreateUserDocs`. Do not introduce a generic configurable Swagger factory.

The composite owns `ApiExtension('x-docs-order', ...)`, `ApiOperation` (explicit ID, summary, description), request DTO references, success response DTO/status/description, reusable error decorators and applicable security metadata. DTO property schemas remain in DTOs. Preserve IDs, examples, schemas, descriptions, statuses and extensions when moving existing documentation.

Reuse the existing decorators at the root of that directory:

- `ApiValidationErrorResponse`: 400 validation envelope.
- `ApiConflictErrorResponse`: 409 HTTP error envelope.
- `ApiInternalErrorResponse`: 500 internal error envelope.
- `ApiInvalidCredentialsResponse` and `ApiInvalidTokenResponse`: 401 application error envelope.
- `ApiInvalidPhoneNumberResponse`: 400 application error envelope.
- `ApiRegisterBadRequestResponses`: a single 400 response using `oneOf` with validation/application DTO references and examples. It registers referenced models through `ApiExtraModels`.

For multiple shapes at one status, compose them into one response as registration does; separate decorators for the same status can overwrite metadata. Do not duplicate common schemas. The current registration Swagger example uses `validation.isEmail`, whereas the runtime formatter emits constraint keys such as `isEmail`; verify examples against execution when changing that contract.

[swagger.config.ts](../src/common/presentation/swagger/swagger.config.ts) builds API information, servers, tags and the security scheme. [swagger.setup.ts](../src/common/presentation/swagger/swagger.setup.ts) generates the document and serves `/api/docs` with `/api/docs-json`. [swagger.constants.ts](../src/common/presentation/swagger/swagger.constants.ts) owns shared names. Preserve the [UI script](../src/common/presentation/swagger/swagger-ui.script.ts) and [CSS](../src/common/presentation/swagger/swagger-ui.css.ts) during endpoint changes.

## 11. Swagger Operation IDs

Use a unique, explicit, stable lower-camel-case ID following the current feature-plus-operation pattern:

| Route                          | operationId        | Composite             |
| ------------------------------ | ------------------ | --------------------- |
| `POST /api/auth/register`      | `authRegister`     | `ApiRegisterDocs`     |
| `POST /api/auth/login`         | `authLogin`        | `ApiLoginDocs`        |
| `POST /api/auth/refresh-token` | `authRefreshToken` | `ApiRefreshTokenDocs` |
| `POST /api/users`              | `usersCreate`      | `ApiCreateUserDocs`   |

Keep IDs stable across internal refactors: client generation and documentation consumers can depend on them. Do not fall back to controller/method-derived IDs for a new operation.

## 12. Swagger Ordering and Grouping

Class tags use `SWAGGER_TAGS`: Authentication precedes Users in the custom tag sorter. The operation sorter reads numeric `x-docs-order`: register is 10, login 20, refresh token 30; create user is 10 within Users. Choose numbers to represent the feature workflow and leave room for additions.

The sorter falls back to 1000 for nonnumeric/missing order, then compares HTTP method priority (POST, GET, PUT, PATCH, DELETE), then path. Preserve extensions inside composites. Add a new tag consistently in constants, document configuration and the tag sorter when intentional positioning is needed.

## 13. Authentication Documentation

The document defines the HTTP bearer/JWT scheme named `access-token` through `SWAGGER_BEARER_AUTH`. Defining that scheme does not protect an endpoint or apply operation security requirements.

**There are currently no guarded endpoints, authorization decorators, `@ApiBearerAuth` usages or global security requirements.** All four routes are unguarded. Registration/login issue credentials; refresh validates a token supplied in the body. There is no existing protected endpoint to copy and no established `@Public()` convention.

When protected behavior is requested, implement and test actual authorization and document it using the existing scheme name; do not imply that Swagger configuration enforces access. Decide security scope based on which routes are protected, avoiding duplicate scheme definitions or accidental protection metadata on public routes.

The custom UI stores returned tokens, reuses access tokens through Swagger authorization, fills refresh requests from stored tokens and adds the selected English/Arabic `Accept-Language` header. Preserve this behavior, but do not treat UI token storage as server-side enforcement.

## 14. Testing

Jest/ts-jest runs colocated `src/**/*.spec.ts` unit tests. E2E tests use Supertest with [test/jest-e2e.json](../test/jest-e2e.json).

| Layer                | Existing coverage and what to add for endpoint work                                                                                                                                                                                                                                                                                                                                          |
| -------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Application/use case | [RefreshTokenUseCase tests](../src/auth/use-cases/refresh-token.usecase.spec.ts) test success, wrong token type, missing stored token and invalid hash, with mocked abstractions. [GenerateTokenUseCase tests](../src/auth/use-cases/generate-token.usecase.spec.ts) cover rotation success/failure. Add business rules, errors and meaningful dependency interactions for changed behavior. |
| Repository           | [MongooseRefreshTokenRepository tests](../src/auth/repositories/mongoose-refresh-token.repository.spec.ts) mock the model and check the conditional update and boolean result. They do not prove database-level concurrency. Add real persistence/integration coverage where a change depends on database semantics.                                                                         |
| Controller/service   | Existing controller and feature-service tests use Nest testing modules and mocked dependencies, but only assert construction. Add input/output mapping and delegation assertions when relevant; direct method tests do not execute HTTP pipes or filters.                                                                                                                                    |
| E2E                  | [app.e2e-spec.ts](../test/app.e2e-spec.ts) imports `AppModule` and checks only an unknown-route 404. It does not install bootstrap's prefix, validation pipe, middleware or Swagger. For endpoint contract tests, configure the relevant bootstrap behavior and assert success/error bodies, validation, authentication if present, and localization where applicable.                       |

`AppModule` E2E tests require valid environment configuration and a reachable MongoDB instance. Use isolated test data/database for persistence tests. Required environment settings are defined in [env.schema.ts](../src/common/config/env.schema.ts); use [.env.example](../.env.example) for setup. Do not claim endpoint coverage merely because the existing bootstrap test passes.

## 15. Endpoint Checklist

- [ ] Inspect similar code and establish route, success/error contracts and access requirements.
- [ ] Define application input/output and implement the smallest appropriate service/use-case change.
- [ ] Extend abstractions/infrastructure only as needed; wire providers and imports/exports.
- [ ] Add DTO metadata, explicit mappings, validation and intended transformations.
- [ ] Add matching English/Arabic keys and verify emitted messages/codes.
- [ ] Add a thin controller endpoint and one semantic Swagger composite.
- [ ] Set stable operation ID, logical order, tag, request/success/error schemas and applicable security metadata.
- [ ] Test business behavior, mapping and persistence changes at the appropriate boundaries.
- [ ] Test HTTP contracts, including validation, sensitive response fields, auth and localization where applicable.
- [ ] Run `pnpm format`, then `pnpm check` for endpoint implementation changes.
- [ ] Inspect `/api/docs` and `/api/docs-json`; for documentation refactors, compare generated documents before/after.
- [ ] Review the diff for unrelated changes and report validation limits.

The [package scripts](../package.json) expand `pnpm check` into these checks in order:

```sh
pnpm format:check
pnpm lint
pnpm typecheck
pnpm test
pnpm test:e2e
pnpm build
```

`pnpm format` and `format:check` target TypeScript in `src/` and `test/`, not Markdown. For this guide use:

```sh
pnpm exec prettier --write docs/API_DEVELOPMENT_GUIDE.md
pnpm exec prettier --check docs/API_DEVELOPMENT_GUIDE.md
```

[lint-staged.config.mjs](../lint-staged.config.mjs) formats staged Markdown with Prettier. Documentation-only changes need path/content verification and formatting; running application tests again is unnecessary unless executable behavior or test configuration changed. Follow [git-workflow.md](git-workflow.md) for repository Git conventions.

## 16. AI Coding Rules

**Before coding:** read this guide, inspect similar endpoints and the working-tree state, reuse existing patterns, and justify any necessary architectural departure. A repository guide is not automatically loaded merely because it exists under `docs/`; agents should read this file explicitly.

**While coding:** make the smallest clean change within scope. Preserve architecture and response contracts. Do not introduce `any`, unnecessary abstractions, controller business logic, direct application dependencies on infrastructure, duplicate Swagger/validation/i18n definitions, or unrelated refactors. Distinguish an observed implementation gap from intended behavior; do not present gaps listed here as patterns to copy.

**After coding:** run relevant tests and the full endpoint validation sequence when appropriate, inspect generated Swagger and actual responses, review the diff, and state any checks that were unavailable. Maintain this guide when the endpoint work establishes a new convention.

## 17. Existing Examples

### A. Simple endpoint

From [UsersController](../src/users/users.controller.ts), with imports omitted:

```ts
@Post()
@ApiCreateUserDocs()
async create(@Body() data: CreateUserDto): Promise<UserResponseDto> {
  const input = UserMapper.toInput(data);
  const user = await this.usersService.create(input);
  return UserMapper.toResponse(user);
}
```

This demonstrates thin HTTP mapping. Review the serialization and hashing gaps in section 5 before reusing its response behavior.

### B. Authentication flow; no protected endpoint exists

From [RefreshTokenUseCase](../src/auth/use-cases/refresh-token.usecase.ts):

```ts
const decodedToken = await this.tokenService.verify(body.token);

if (decodedToken.type !== 'refresh') throw new ApplicationError('INVALID_TOKEN');
```

This validates a body-supplied refresh token through an abstraction. It is not bearer authorization on a protected route; the requested protected-endpoint example is unavailable in the current repository.

### C. Validation and application errors

The password property in [RegisterDto](../src/auth/presentation/dtos/register.dto.ts) uses the following validation (Swagger metadata omitted here):

```ts
@IsRequiredString({ min: 8, max: 128 })
password!: string;
```

Separately, [RegisterUseCase](../src/auth/use-cases/register.usecase.ts) enforces the application phone rule:

```ts
const phoneNumber = parseAndValidatePhone(body.countryCode, body.phone);

if (!phoneNumber) {
  throw new ApplicationError('INVALID_PHONE_NUMBER');
}
```

### D. Semantic Swagger composition

Excerpt from [ApiLoginDocs](../src/common/presentation/swagger/decorators/auth/api-login-docs.decorator.ts); imports omitted, operation metadata abbreviated:

```ts
export const ApiLoginDocs = () =>
  applyDecorators(
    ApiExtension('x-docs-order', 20),
    ApiOperation({ operationId: 'authLogin', summary: 'Login user' }),
    ApiBody({ type: LoginDto }),
    ApiCreatedResponse({
      description: 'Authentication successful. Returns access and refresh tokens.',
      type: AuthResponseDto,
    }),
    ApiValidationErrorResponse(),
    ApiInvalidCredentialsResponse(),
    ApiInternalErrorResponse(),
  );
```

The real decorator also includes the operation description; preserve it when editing. Property schemas remain in `LoginDto` and `AuthResponseDto`.
