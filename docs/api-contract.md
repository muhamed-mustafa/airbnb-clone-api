# HTTP API contract

Base path: `/api`. Request bodies use `application/json`. Authorization uses
`Authorization: Bearer <accessToken>`. Both admin and user tokens use the same HTTP
header; permissions are enforced by the JWT and role guards.

## Authentication

| Method | Path                      | Access                      | Success |
| ------ | ------------------------- | --------------------------- | ------- |
| POST   | `/api/auth/register`      | Public                      | 201     |
| POST   | `/api/auth/login`         | Public                      | 200     |
| POST   | `/api/auth/admin/login`   | Public                      | 200     |
| POST   | `/api/auth/refresh-token` | Valid refresh token in body | 200     |
| GET    | `/api/auth/me`            | Admin or User               | 200     |

Swagger captures the tokens returned by registration, login, and refresh. It keeps
admin and user sessions independent. The Shared documentation session selector
chooses which session is used. A token being set does not establish its validity;
the server validates it when processing each request.

## Resource collections

The following matrix applies independently to `countries`, `cities`, `currencies`,
and `unit-categories` (20 operations):

| Method | Path                   | Access | Success               |
| ------ | ---------------------- | ------ | --------------------- |
| GET    | `/api/{resource}`      | Public | 200                   |
| GET    | `/api/{resource}/{id}` | Public | 200                   |
| POST   | `/api/{resource}`      | Admin  | 201                   |
| PATCH  | `/api/{resource}/{id}` | Admin  | 200                   |
| DELETE | `/api/{resource}/{id}` | Admin  | 204, no response body |

Collection reads use the existing pagination and filter query parameters shown
in OpenAPI. Resource names are plural and use kebab-case. Partial updates use
PATCH. Authorization belongs in guards, independently of the URL structure.

## Admin accounts and application settings

| Method | Path                | Access | Success |
| ------ | ------------------- | ------ | ------- |
| GET    | `/api/admins`       | Admin  | 200     |
| GET    | `/api/admins/{id}`  | Admin  | 200     |
| GET    | `/api/app-settings` | Admin  | 200     |
| PATCH  | `/api/app-settings` | Admin  | 200     |

Application settings are a singleton: PATCH changes only supplied fields and
preserves the existing behavior of initializing the settings on the first update.
There are currently no implemented `/api/users` operations.

## Response and error conventions

Production successful JSON responses use the existing `{ data }` envelope;
paginated lists use `{ data, meta }`. DELETE returns 204 without a JSON body.
DTOs and application rules validate requests. Missing/invalid access tokens yield
401; disallowed roles yield 403; unknown resources yield 404; invalid input yields 400. Each operation's OpenAPI document describes its detailed responses.

## Client migration

These are breaking contract changes. Update client paths, methods, and status
assertions; old paths and methods have not been retained as aliases.

| Previous                       | Current                        |
| ------------------------------ | ------------------------------ |
| `POST /api/admin/login`        | `POST /api/auth/admin/login`   |
| `GET /api/admin`               | `GET /api/admins`              |
| `GET /api/admin/{id}`          | `GET /api/admins/{id}`         |
| `PUT /api/app-settings`        | `PATCH /api/app-settings`      |
| Login and refresh success: 201 | Login and refresh success: 200 |

Registration and resource creation continue to return 201. Existing read, partial
resource update, and delete paths remain as listed above.

## Documentation

`/api/docs/user`, `/api/docs/admin`, and `/api/docs/shared` group operations by
audience. Each operation belongs to one audience; this does not alter runtime
permissions. Navigation loads each OpenAPI document without a full page reload.
