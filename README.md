# Airbnb Clone API

![Node](https://img.shields.io/badge/node-26.x-339933) ![NestJS](https://img.shields.io/badge/NestJS-11-E0234E) ![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178C6) ![MongoDB](https://img.shields.io/badge/MongoDB-8-47A248)

A layered NestJS REST API for a short-term rental platform: authentication, admin-managed reference data, accommodation listings ("units"), and image uploads.

This is a backend-only project built to practise production-style API design rather than to ship a full Airbnb replica. It demonstrates a strict layered architecture with lint-enforced dependency rules, a uniform error contract with English/Arabic localisation, refresh-token rotation, optimistic concurrency control on listings, MongoDB transactions, and a pluggable file-storage port with Cloudinary and S3 adapters. Bookings, payments and reviews are not implemented (see [Project Status](#project-status)).

## Features

- **Authentication** — user registration and login, separate admin login, short-lived JWT access tokens, and refresh-token rotation. Refresh tokens and passwords are stored as Argon2 hashes.
- **Role-based access control** — global `JwtAuthGuard` and `RolesGuard`; routes are secured by default and opt out with `@IsPublic()` or restrict with `@AllowedRoles()`.
- **Reference data** — admin CRUD with public, paginated reads for countries, cities, currencies and unit categories.
- **Units (listings)** — create, update, activate, deactivate and soft-delete by the owner; public browsing with pagination and filters (text search, price range, category, country, city, capacity, amenities).
- **Optimistic concurrency** — unit mutations require an `expectedVersion`; a stale version returns a `UNIT_VERSION_CONFLICT` error instead of silently overwriting.
- **Image uploads** — single and batch (up to 5) JPEG/PNG/WebP uploads, 5 MiB each, through a storage port with Cloudinary and AWS S3 adapters selected by configuration.
- **Image lifecycle** — uploads are tracked in MongoDB; photos removed from a unit are marked for deletion in the same transaction as the unit update, and a background worker retries storage deletion every minute.
- **Application settings** — a singleton document (VAT rate, minimum price) that feeds unit validation.
- **Consistent API contract** — `{ data }` / `{ data, meta }` success envelope and a single `{ errors: [{ code, message }] }` error shape across validation, HTTP and domain errors.
- **Internationalisation** — validation and error messages in English and Arabic, selected by `Accept-Language`.
- **Observability** — structured Pino logging with secret redaction and a per-request ID (`x-request-id`) propagated via `AsyncLocalStorage`.
- **OpenAPI documentation** — Swagger UI split into three audience-specific documents (user, admin, shared).

## Architecture

```text
src/
├── app/              # Composition root: Nest modules binding tokens to implementations
├── presentation/     # HTTP layer
│   ├── <feature>/    #   controllers, request/response DTOs, HTTP mappers
│   ├── auth/         #   guards and decorators (@IsPublic, @AllowedRoles, @CurrentUser)
│   ├── filters/      #   exception filters (application, validation, HTTP, global)
│   ├── middleware/   #   request-context / request logging
│   └── swagger/      #   OpenAPI setup, per-endpoint doc decorators, audience documents
├── application/      # Business logic
│   └── <feature>/    #   use cases, feature services, entities, inputs/outputs,
│                     #   repository interfaces + injection tokens
├── infrastructure/   # Adapters
│   ├── <feature>/    #   Mongoose schemas, repositories, persistence mappers
│   ├── auth/         #   JWT and Argon2 implementations
│   ├── files/        #   Cloudinary and S3 storage adapters
│   ├── database/     #   transaction runner, collation, duplicate-key helpers
│   └── logging/      #   Pino logger
└── common/           # Config + env validation, errors, i18n, pagination, shared contracts
test/                 # e2e and MongoDB-backed integration suites
docs/                 # API contract, file storage, git workflow, architecture notes
```

Design decisions present in the code:

- **Dependency direction is enforced, not just documented.** `eslint.config.mjs` uses `no-restricted-imports` so that `application` cannot import `presentation`, `infrastructure`, or packages such as `mongoose`, `@nestjs/jwt`, `@nestjs/config`, `argon2` and `express`. The application layer still uses Nest's `@Injectable()`/`@Inject()`; it is layered, not framework-free.
- **Ports and adapters via injection tokens.** Repositories, token service, hashing, logger, transaction runner and file storage are interfaces in `application`/`common`, bound to implementations in `src/app/*.module.ts`.
- **Explicit mapping at each boundary.** DTO → input → entity → response DTO, with separate mappers in the presentation and infrastructure layers; Mongoose documents never leave infrastructure.
- **Domain errors are typed codes.** Use cases throw `ApplicationError(code)`; the presentation layer maps codes to HTTP statuses and localised messages.
- **Transactions.** Unit create/update run inside MongoDB transactions, which is why the local database runs as a single-node replica set.

## Tech Stack

| Area          | Technology                                              |
| ------------- | ------------------------------------------------------- |
| Runtime       | Node.js (version pinned in `.nvmrc`), TypeScript 5.7    |
| Framework     | NestJS 11 (Express platform)                            |
| Database      | MongoDB 8, Mongoose 9                                   |
| Auth          | `@nestjs/jwt`, Argon2                                   |
| Validation    | class-validator / class-transformer, Joi (environment)  |
| File storage  | Cloudinary SDK, AWS SDK v3 (S3), Multer                 |
| i18n          | nestjs-i18n (en, ar)                                    |
| Logging       | Pino                                                    |
| API docs      | `@nestjs/swagger`                                       |
| Testing       | Jest 30, Supertest                                      |
| Tooling       | pnpm, ESLint 9, Prettier, Husky, lint-staged, commitlint |

## Getting Started

### Prerequisites

- Node.js matching `.nvmrc`
- pnpm
- Docker (for the local MongoDB replica set), or your own MongoDB replica set
- A Cloudinary account, or an S3 bucket with an HTTPS delivery URL — the application validates storage configuration at startup and will not boot without one of them

### Install and run

```bash
git clone https://github.com/muhamed-mustafa/airbnb-clone-api.git
cd airbnb-clone-api
pnpm install

cp .env.example .env        # then fill in the required values (see below)

pnpm docker:up              # MongoDB (replica set rs0) on 127.0.0.1:27017, plus MinIO
pnpm start:dev              # watch mode
```

The API is served under `http://localhost:3000/api`. On first start, an initial super admin is created from the `INITIAL_ADMIN_*` variables.

Other scripts: `pnpm build`, `pnpm start:prod`, `pnpm lint`, `pnpm typecheck`, `pnpm format`, and `pnpm check` (format check, lint, typecheck, unit tests, e2e tests and build in one pass).

> `docker-compose.yml` also starts a MinIO container, but the S3 adapter currently has no custom-endpoint option, so MinIO is not wired to the application. There is no Dockerfile for the API itself.

## Environment Variables

Validated at startup with Joi (`src/common/config/env.schema.ts`).

| Variable                  | Required            | Default             | Meaning                                                    |
| ------------------------- | ------------------- | ------------------- | ---------------------------------------------------------- |
| `PORT`                    | No                  | `3000`              | HTTP port                                                  |
| `NODE_ENV`                | No                  | `development`       | `development`, `test`, `staging` or `production`           |
| `MONGO_URI`               | Yes                 | —                   | MongoDB connection string (replica set required)           |
| `FALLBACK_LANGUAGE`       | No                  | `en`                | `en` or `ar`                                               |
| `JWT_SECRET`              | Yes                 | —                   | Access-token signing secret                                |
| `REFRESH_TOKEN_SECRET`    | Yes                 | —                   | Refresh-token signing secret                               |
| `ACCESS_TOKEN_EXPIRE_IN`  | No                  | `15m`               | Access-token lifetime                                      |
| `REFRESH_TOKEN_EXPIRE_IN` | No                  | `30d`               | Refresh-token lifetime                                     |
| `INITIAL_ADMIN_NAME`      | No                  | `Super Admin`       | Name of the seeded admin                                   |
| `INITIAL_ADMIN_EMAIL`     | No                  | `admin@example.com` | Email of the seeded admin                                  |
| `INITIAL_ADMIN_PASSWORD`  | Yes                 | —                   | Password of the seeded admin (min. 8 characters)           |
| `FILE_STORAGE_PROVIDER`   | No                  | `cloudinary`        | `cloudinary` or `s3`                                       |
| `CLOUDINARY_CLOUD_NAME`   | If `cloudinary`     | —                   | Cloudinary cloud name                                      |
| `CLOUDINARY_API_KEY`      | If `cloudinary`     | —                   | Cloudinary API key                                         |
| `CLOUDINARY_API_SECRET`   | If `cloudinary`     | —                   | Cloudinary API secret                                      |
| `AWS_REGION`              | If `s3`             | —                   | S3 bucket region                                           |
| `AWS_S3_BUCKET`           | If `s3`             | —                   | S3 bucket name                                             |
| `AWS_S3_BASE_URL`         | If `s3`             | —                   | HTTPS delivery base URL (e.g. a CloudFront distribution)   |
| `AWS_S3_KEY_PREFIX`       | No                  | `airbnb/units`      | Object key prefix for uploads                              |
| `AWS_ACCESS_KEY_ID`       | No (pair)           | —                   | Static credentials; omit to use the SDK default chain      |
| `AWS_SECRET_ACCESS_KEY`   | No (pair)           | —                   | Must be set together with `AWS_ACCESS_KEY_ID`              |
| `AWS_SESSION_TOKEN`       | No                  | —                   | Only for temporary credentials                             |
| `API_BASE_URL`            | No                  | —                   | Adds a second server entry to the Swagger document         |

See `docs/file-storage.md` for the S3/CloudFront setup the adapter expects.

## API Overview

All routes are prefixed with `/api`. Swagger UI is served at `/api/docs` (redirects to `/api/docs/user`), with `/api/docs/admin` and `/api/docs/shared` for the other audiences. Authenticated routes expect `Authorization: Bearer <accessToken>`.

| Module          | Method | Path                          | Purpose                                   | Auth          |
| --------------- | ------ | ----------------------------- | ----------------------------------------- | ------------- |
| Auth            | POST   | `/auth/register`              | Register a user, returns tokens           | Public        |
| Auth            | POST   | `/auth/login`                 | User login                                | Public        |
| Auth            | POST   | `/auth/admin/login`           | Admin login                               | Public        |
| Auth            | POST   | `/auth/refresh-token`         | Rotate refresh token                      | Refresh token |
| Auth            | GET    | `/auth/me`                    | Current token identity                    | User or Admin |
| Units           | GET    | `/units`                      | Browse active units (filters, pagination) | Public        |
| Units           | GET    | `/units/:id`                  | Get one active unit                       | Public        |
| Units           | GET    | `/units/me`                   | List the caller's own units               | User          |
| Units           | POST   | `/units`                      | Create a unit                             | User          |
| Units           | PATCH  | `/units/:id`                  | Update a unit (owner, versioned)          | User          |
| Units           | PATCH  | `/units/:id/activate`         | Activate a unit                           | User          |
| Units           | PATCH  | `/units/:id/deactivate`       | Deactivate a unit                         | User          |
| Units           | DELETE | `/units/:id`                  | Soft-delete a unit                        | User          |
| Files           | POST   | `/files/images`               | Upload one image                          | User          |
| Files           | POST   | `/files/images/batch`         | Upload 1–5 images                         | User          |
| Reference data  | GET    | `/{resource}`, `/{resource}/:id` | List (paginated) / get one             | Public        |
| Reference data  | POST   | `/{resource}`                 | Create                                    | Admin         |
| Reference data  | PATCH  | `/{resource}/:id`             | Update                                    | Admin         |
| Reference data  | DELETE | `/{resource}/:id`             | Delete                                    | Admin         |
| Admins          | GET    | `/admins`, `/admins/:id`      | List / get admin accounts                 | Admin         |
| App settings    | GET    | `/app-settings`               | Read settings                             | Admin         |
| App settings    | PATCH  | `/app-settings`               | Create or update settings                 | Admin         |

`{resource}` is one of `countries`, `cities`, `currencies`, `unit-categories`. The full contract is in `docs/api-contract.md`.

## Testing

```bash
pnpm test         # unit tests (src/**/*.spec.ts)
pnpm test:cov     # unit tests with coverage report
pnpm test:e2e     # e2e suites (test/*.e2e-spec.ts); no live database needed
```

MongoDB-backed integration suites are opt-in, one script per resource. Each needs its own connection variable and runs against a freshly generated database name:

```bash
COUNTRIES_TEST_MONGO_URI=mongodb://localhost:27017 pnpm test:countries:integration
```

Equivalent scripts exist for `cities`, `currencies`, `unit-categories`, `app-settings` and `admin` (`CITIES_TEST_MONGO_URI`, `CURRENCIES_TEST_MONGO_URI`, `UNIT_CATEGORIES_TEST_MONGO_URI`, `APP_SETTINGS_TEST_MONGO_URI`, `ADMIN_TEST_MONGO_URI`).

What is covered: auth use cases (token generation, refresh rotation), JWT service, refresh-token repository, environment schema, logger, request-context middleware, selected controllers, the Swagger audience documents and API contract, the unified error-response format, and HTTP + database behaviour for the reference-data, admin and app-settings endpoints. The units module and the storage adapters do not yet have dedicated tests.

## Project Status

Work in progress; developed incrementally with conventional commits.

**Done**

- Auth with refresh-token rotation, RBAC, admin seeding
- Countries, cities, currencies, unit categories, app settings
- Unit lifecycle with ownership checks, filtering and optimistic concurrency
- Image uploads (Cloudinary / S3) with tracked, retryable deletion
- Unified error contract, i18n (en/ar), structured logging, audience-split Swagger

**Not done yet**

- Bookings, availability calendar, payments and reviews
- User profile endpoints (`/users` controller exists but has no routes)
- Logout / refresh-token revocation, password reset, email verification
- Rate limiting, CORS and security-header configuration
- Tests for the units module and file-storage adapters
- CI pipeline and a Dockerfile for the API

## Author

[muhamed-mustafa](https://github.com/muhamed-mustafa)
