# Git Workflow & Commit Conventions

This document establishes the development standards, Git workflow, local quality gates, and commit message conventions for the `airbnb-clone-api` project.

Following these practices ensures consistent code quality, clean Git history, automated formatting, and seamless collaboration across the engineering team.

---

## 1. Commit Lifecycle & Quality Gates

Every commit passes through automated local quality gates managed by **Husky**, **lint-staged**, **ESLint**, **Prettier**, and **Commitlint**.

```text
Write & Stage Code
        │
        ▼
   git add <files>
        │
        ▼
  Staged Files Ready
        │
        ▼
 git commit -m "..."
        │
        ▼
 ┌─────────────────────────────────────────┐
 │ Hook: Husky pre-commit                  │
 │ Command: pnpm lint-staged               │
 │                                         │
 │ ├── TypeScript files:                   │
 │ │   ├── ESLint (--fix)                  │
 │ │   └── Prettier (--write)              │
 │ └── Config/JSON/MD/YAML files:          │
 │     └── Prettier (--write)              │
 └────────────────────┬────────────────────┘
                      │ Passed
                      ▼
 ┌─────────────────────────────────────────┐
 │ Hook: Husky commit-msg                  │
 │ Command: pnpm exec commitlint --edit $1 │
 │                                         │
 │ └── Validates Conventional Commit format│
 └────────────────────┬────────────────────┘
                      │ Passed
                      ▼
            Commit Created Successfully
```

### How the Quality Gates Work

1. **Stage Changes:** You stage modified files using `git add`.
2. **Pre-Commit Gate (`pre-commit`):** Husky triggers `pnpm lint-staged`. Only the files staged for this commit are checked and formatted.
3. **Commit Message Gate (`commit-msg`):** Husky passes your commit message to Commitlint, which verifies adherence to the Conventional Commits specification.
4. **Commit Finalized:** If all checks pass, Git records the commit. If any check fails, the commit is aborted before any history is modified.

---

## 2. Husky

[Husky](https://typicode.github.io/husky/) integrates native Git hooks with npm/pnpm project scripts.

### Repository Hooks Configuration

- **`prepare` Script (`package.json`):**

  ```json
  "prepare": "husky"
  ```

  Runs automatically on `pnpm install` to initialize local hooks in `.husky/`.

- **`pre-commit` Hook (`.husky/pre-commit`):**

  ```sh
  pnpm lint-staged
  ```

  Executes before Git creates the commit object. Blocks the commit if any linter error occurs or cannot be auto-fixed.

- **`commit-msg` Hook (`.husky/commit-msg`):**
  ```sh
  pnpm exec commitlint --edit "$1"
  ```
  Reads the temporary commit message file (`$1`) and validates the message against conventional commit rules.

---

## 3. lint-staged

`lint-staged` optimizes development speed by running linters and formatters only against files currently staged for commit (`git add`), rather than scanning the entire repository.

### Difference: `pnpm lint` vs `pnpm lint-staged`

| Tool / Command     | Target Scope                  | Purpose                                         |
| :----------------- | :---------------------------- | :---------------------------------------------- |
| `pnpm lint`        | Entire workspace (`eslint .`) | Full project validation across all files        |
| `pnpm lint-staged` | Staged files only             | Fast pre-commit quality check on modified files |

### Configured Rules (`lint-staged.config.mjs`)

The project uses the following execution matrix:

```javascript
export default {
  '{src,test}/**/*.ts': ['eslint --fix', 'prettier --write'],
  '*.{js,mjs,cjs,json,md,yml,yaml}': ['prettier --write'],
};
```

- **TypeScript Files (`{src,test}/**/*.ts`):**
  1. Runs `eslint --fix` to catch type violations, unused variables, and enforce coding standards.
  2. Runs `prettier --write` to format code according to `.prettierrc`.
  3. Re-stages any automatic fixes.
- **Configuration & Documentation Files (`*.{js,mjs,cjs,json,md,yml,yaml}`):**
  1. Runs `prettier --write` to ensure consistent indentation, line wrapping, and syntax styling.

---

## 4. Pre-Commit Execution Examples

### Successful Pre-Commit Flow

```bash
git add src/users/users.service.ts
git commit -m "feat(users): add user lookup service"
```

Execution output:

```text
✔ Preparing lint-staged...
✔ Running tasks for staged files...
  ❯ {src,test}/**/*.ts — 1 file
    ✔ eslint --fix
    ✔ prettier --write
✔ Applying modifications from tasks...
✔ Cleaning up temporary files...
[feat/users 219f3e5] feat(users): add user lookup service
 1 file changed, 12 insertions(+)
```

**What happened:**

1. Husky triggered `lint-staged`.
2. ESLint analyzed `src/users/users.service.ts` (0 errors).
3. Prettier formatted the file and staged the changes.
4. Commitlint validated `"feat(users): add user lookup service"` (Valid Conventional Commit).
5. The commit succeeded.

---

### Failed Pre-Commit Flow (Lint Violation)

Suppose you stage a file containing an unused variable:

```typescript
// src/example.ts
export class ExampleService {
  public execute(): void {
    const unusedVariable = 'hello';
  }
}
```

```bash
git add src/example.ts
git commit -m "feat: add example service"
```

Execution output:

```text
✖ eslint --fix:
  src/example.ts:3:11
  error  'unusedVariable' is assigned a value but never used  @typescript-eslint/no-unused-vars

husky - pre-commit script failed (code 1)
```

**Why it failed:**

- ESLint encountered a `@typescript-eslint/no-unused-vars` error that cannot be auto-fixed.
- The pre-commit hook aborted immediately with exit code 1.
- The commit was blocked before Commitlint was even called.

**How to resolve:**

1. Remove the unused variable or prefix it with `_` (e.g., `_unusedVariable` per `.eslintrc` rule).
2. Re-stage the file: `git add src/example.ts`.
3. Commit again: `git commit -m "feat: add example service"`.

---

## 5. Conventional Commits

Commit messages must strictly adhere to the [Conventional Commits](https://www.conventionalcommits.org/) standard:

```text
type(scope): description
```

### Format Breakdown

```text
  feat(auth): add login endpoint
  │   │       │
  │   │       └─ Description: Imperative, present tense, lowercase, no trailing period
  │   └───────── Scope (optional): Area or module of the application affected
  └───────────── Type: Category of change (feat, fix, refactor, test, etc.)
```

- **Type:** Describes the nature of the change (required).
- **Scope:** Indicates the codebase area or module affected (optional but strongly recommended for feature work).
- **Description:** Clear, concise summary in the imperative mood (required).

---

## 6. Commit Types

The project uses `@commitlint/config-conventional` (`commitlint.config.mjs`). The following types are enforced:

| Type       | When to Use                                                       | Example                                  |
| :--------- | :---------------------------------------------------------------- | :--------------------------------------- |
| `feat`     | Adding a new feature or endpoint                                  | `feat(auth): add login endpoint`         |
| `fix`      | Fixing a bug or resolving an error                                | `fix(config): respect environment port`  |
| `refactor` | Code change that neither fixes a bug nor adds a feature           | `refactor(users): simplify user lookup`  |
| `test`     | Adding, updating, or refactoring unit/e2e tests                   | `test(auth): add login e2e tests`        |
| `docs`     | Documentation-only additions or updates                           | `docs: document local setup`             |
| `chore`    | Maintenance tasks, tooling, config, dependencies                  | `chore(tooling): configure husky`        |
| `style`    | Formatting, whitespace, semicolon changes (no code logic changes) | `style: format source files`             |
| `perf`     | Performance optimizations                                         | `perf(listings): optimize search query`  |
| `ci`       | CI/CD configuration and pipeline scripts                          | `ci: add pull request checks`            |
| `build`    | Changes to build system, dependencies, or package configs         | `build: update typescript configuration` |

---

## 7. Recommended Scopes for This Project

Use specific, meaningful scopes based on the project architecture:

| Scope        | Architectural Area                               | Example File / Module          |
| :----------- | :----------------------------------------------- | :----------------------------- |
| `auth`       | Authentication, tokens, guards, strategies       | `src/auth/`                    |
| `users`      | User management and profiles                     | `src/users/`                   |
| `config`     | Environment variables and validation schemas     | `src/common/config/`           |
| `i18n`       | Internationalization and translations            | `src/i18n/`                    |
| `database`   | MongoDB connection, Mongoose schemas, plugins    | `CoreModule`, schemas          |
| `errors`     | Exception filters and custom error classes       | `src/common/errors-handling/`  |
| `validation` | DTOs, validation pipes, and error formatters     | Validation pipes, DTOs         |
| `tooling`    | ESLint, Prettier, Husky, Commitlint              | Tooling configuration files    |
| `docker`     | Dockerfile, Docker Compose                       | `docker-compose.yml`           |
| `tests`      | Unit tests, E2E fixtures, test configuration     | `test/`, `*.spec.ts`           |
| `api`        | Global bootstrap, prefix, versioning, middleware | `src/main.ts`, `app.module.ts` |

_Note:_ Scope is optional for general changes. For example: `docs: update contributing guide` or `style: format project root`.

---

## 8. Commit Message Examples

### Good Examples

```text
feat(auth): add user registration endpoint
feat(users): define user mongoose schema and model
feat(i18n): add arabic translation keys for validation

fix(config): allow PORT environment variable override
fix(database): handle mongo disconnection and retry logic
fix(errors): correct typo in formatError method signature

refactor(config): simplify multi-environment mapper
refactor(errors): centralize global exception filters

test(auth): add registration integration tests
test(users): add user service unit test suite

chore(tooling): configure husky pre-commit and commitlint
chore(deps): update nestjs core packages to latest patch

docs(workflow): document git conventions and quality gates

ci: configure github actions validation workflow
```

---

### Bad vs Improved Examples

| Bad Commit Message             | Problem                                          | Improved Alternative                                   |
| :----------------------------- | :----------------------------------------------- | :----------------------------------------------------- |
| `update`                       | No type, no context, completely uninformative    | `refactor(config): simplify environment configuration` |
| `fix`                          | Missing scope and description of the bug         | `fix(database): resolve connection timeout on startup` |
| `done`                         | Meaningless status update                        | `feat(users): implement user profile lookup service`   |
| `WIP`                          | Work-in-progress commit pushed to shared history | `feat(auth): add password hashing utility`             |
| `feat: added changes to auth.` | Past tense, contains trailing period             | `feat(auth): add jwt authentication strategy`          |
| `TEST`                         | Uppercase type, no description                   | `test(users): add unit test coverage for controller`   |
| `bug fix in controller`        | Missing Conventional Commit type format          | `fix(users): return 404 when user id not found`        |

---

## 9. Commit Message Writing Rules

Follow these core rules for all commit messages:

1. **Lowercase type & scope:** Always use lowercase (`feat`, `fix`, `chore`). Never write `FEAT` or `Fix`.
2. **Imperative mood:** Use imperative verbs (e.g., `add`, `fix`, `refactor`, `change`), not past tense (`added`, `fixed`, `changed`) or progressive tense (`adding`, `fixing`).
3. **No trailing punctuation:** Do not end the commit message with a period (`.`) or exclamation mark (`!`).
4. **Concise subject line:** Keep the first line under 72 characters.
5. **Describe the "what" and "why":** Explain what change was made, not your personal actions.
6. **One logical change per commit:** Avoid giant commits bundling multiple unrelated changes. Small, focused commits make code review and rollbacks straightforward.
7. **Avoid filler words:** Do not use vague terms such as `changes`, `stuff`, `various fixes`, or `miscellaneous`.

---

## 10. Staging Files

Carefully staging files allows you to create atomic, well-scoped commits.

### Inspecting Changes

```bash
# 1. Check working directory status
git status

# 2. View unstaged changes in modified files
git diff

# 3. View changes in files that are STAGED and will enter the next commit
git diff --cached
```

### Staging Best Practices

```bash
# Stage a specific file
git add src/auth/auth.service.ts

# Stage a specific directory
git add src/users/

# Verify what is staged before committing
git diff --cached
```

_Avoid_ blindly running `git add .` when working on multiple tasks at once. Review `git status` and `git diff` first to ensure only relevant changes enter the commit.

---

## 11. Recommended Daily Workflow

Follow this step-by-step developer loop:

```bash
# 1. Check your branch status
git status

# 2. Review what changed
git diff

# 3. Stage the files related to your specific task
git add src/users/users.service.ts src/users/users.controller.ts

# 4. Confirm staged changes
git diff --cached

# 5. Commit with a valid Conventional Commit message
git commit -m "feat(users): add user lookup service"

# 6. Push to remote branch
git push origin <branch-name>
```

---

## 12. Pre-Commit vs Full Project Quality Checks

Local quality gates operate at two distinct levels: **Fast Pre-Commit Checks** (per commit) and **Full Project Verification** (before pushing or opening a PR).

| Command / Tool           | Execution Scope                  | When to Run                   | Purpose                                                  |
| :----------------------- | :------------------------------- | :---------------------------- | :------------------------------------------------------- |
| `pnpm lint-staged`       | Staged files only                | Automatically on `git commit` | Fast validation (ESLint + Prettier) on changed files     |
| `pnpm lint`              | Entire workspace                 | Before pushing / in CI        | Scans all TypeScript and JS files with ESLint            |
| `pnpm format:check`      | `src/` and `test/`               | Before pushing / in CI        | Verifies Prettier compliance across all source files     |
| `pnpm exec tsc --noEmit` | Full TypeScript project          | Before pushing / in CI        | Complete TypeScript type-checking without emitting files |
| `pnpm test`              | Unit test files (`*.spec.ts`)    | Before pushing / in CI        | Runs Jest unit test suites                               |
| `pnpm test:e2e`          | E2E test files (`*.e2e-spec.ts`) | Before pushing / in CI        | Runs end-to-end integration tests                        |
| `pnpm build`             | Entire application               | Before pushing / in CI        | Verifies production NestJS compilation                   |

### Why Not Run Everything on Pre-Commit?

Running the entire test suite, E2E tests, and production build on every single commit slows down developer workflow significantly. `lint-staged` guarantees that files leaving your workspace are clean and properly formatted in seconds, while the full suite (`pnpm lint`, `pnpm test`, `pnpm build`) verifies overall project integrity prior to merge.

---

## 13. Troubleshooting & Common Failures

### 1. ESLint Blocks the Commit

**Symptom:**

```text
✖ eslint --fix:
  src/example.ts:5:9
  error  'userId' is assigned a value but never used  @typescript-eslint/no-unused-vars

husky - pre-commit script failed (code 1)
```

**Resolution:**
Fix the linting error in the code (or prefix unused parameter with `_userId`), stage the file with `git add`, and re-run `git commit`.

---

### 2. Prettier Modifies a Staged File

**Symptom:**
Prettier automatically reformats lines during `lint-staged`.

**Resolution:**
`lint-staged` automatically applies `prettier --write` and re-stages the changes. If formatting changes occur, no manual action is needed—the formatted code is included in the commit.

---

### 3. Commitlint Rejects the Commit Message

**Symptom:**

```text
⧗   input: update stuff
✖   subject may not be empty [subject-empty]
✖   type may not be empty [type-empty]

✖   found 2 errors, 0 warnings
husky - commit-msg script failed (code 1)
```

**Resolution:**
Provide a valid Conventional Commit message:

```bash
git commit -m "refactor(config): simplify environment configuration"
```

---

### 4. Need to Inspect Staged Changes

**Resolution:**
Run `git diff --cached` to verify the exact diff that will be committed.

---

## 14. Quick Reference

### Type Cheat Sheet

```text
feat      New feature or endpoint
fix       Bug fix
refactor  Internal code change (no behavior change)
test      Unit or E2E tests
docs      Documentation updates
chore     Tooling, build, dependency maintenance
style     Formatting and style adjustments
perf      Performance optimization
ci        CI/CD workflows and pipelines
build     Build system changes
```

### Commit Template

```text
type(scope): description
```

### Quick Examples

```bash
git commit -m "feat(auth): add login endpoint"
git commit -m "fix(config): respect environment port"
git commit -m "test(auth): add login e2e tests"
git commit -m "chore(tooling): configure husky and commitlint"
git commit -m "docs: add git workflow documentation"
```
