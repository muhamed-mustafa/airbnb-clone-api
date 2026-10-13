# Units Swagger and logging coverage

Updated 2026-10-13. Existing backend work was preserved; no commit or push was made.

## API documentation

- Shared/Public: `GET /api/units`, `GET /api/units/{id}`.
- User token: `POST /api/units`, `PATCH /api/units/{id}` (owner only for updates).
- List: 11 optional filters plus page/limit, JSON paginated `data` and `meta`, ascending daily cost then ObjectId.
- Title searches title and description literally and case-insensitively. Price limits are inclusive; capacities and facilities are exact matches. No implicit availability/isActive filter.
- Boolean query strings `true`/`false` are now transformed explicitly; `false` no longer becomes true through JavaScript truthiness. Invalid strings fail validation.
- Shared documents omit bearer security and unauthorized/role-rejection responses for public reads. Writes keep their existing authorization documentation.

## Logging

Existing auth, admin and reference-data use cases already had application logging. Forwarding services/controllers do not add duplicate business events.

Added missing events for unit creation, retrieval, update, ownership rejection and validation, and user persistence/lookup. The list message is now `Units listed`.

Request-context middleware records HTTP completion/rejection/disconnection once, with requestId, method, route template, status and duration. It does not record bodies, query strings, actual path parameter values, credentials or token headers. Existing global exception logging remains responsible for unexpected error stacks.

Tests cover authorization document placement, list query schemas and response envelopes, boolean query conversion, logger injection, success/failure events, secret-free log context and one completion event per request.

Verification: 57 tests across 16 suites passed; TypeScript, ESLint and production build passed. Formatting is checked on the files changed for this task. No database write/integration run was performed for this change.
