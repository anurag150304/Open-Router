---
trigger: always_on
---

# Project Rules & Best Practices


## 1. Project Architecture Awareness

- This is a **pnpm monorepo** managed with **Turborepo**. Always respect workspace boundaries.
- Apps: `apps/api`, `apps/primary`, `apps/web`
- Shared packages: `packages/db-config`, `packages/env-config`, `packages/eslint-config`, `packages/tailwind-config`, `packages/typescript`
- **Never** import directly across apps (e.g. `apps/api` must not import from `apps/primary`). Only shared `packages/*` are cross-importable.
- **Never** duplicate logic that already exists in a shared package. Always check `packages/` first.
- When adding a new shared utility or type, put it in the correct `packages/*` — not inside an app.

---

## 2. TypeScript Rules

- **Strict mode is always on.** Never disable `strict`, `noImplicitAny`, or `strictNullChecks`.
- **No `any`.** Use `unknown` and narrow it, or define a proper type/interface.
- **No type assertions (`as X`)** unless you have verified the shape and left a comment explaining why it is safe.
- All function parameters and return types must be **explicitly typed** — do not rely on inference for public-facing functions or service methods.
- Use `interface` for object shapes that may be extended; use `type` for unions, intersections, and mapped types.
- Use `UnwrapSchema` + declaration merging pattern (as already established) for all Elysia schema types.
- Use `NonNullable<T>` to unwrap nested optional types instead of duplicating type definitions.
- Never use `// @ts-ignore` or `// @ts-expect-error` without a detailed comment and a linked issue or TODO.

---

## 3. Elysia.js Conventions (`apps/api`, `apps/primary`)

- Follow the **index.ts / model.ts / service.ts** module pattern strictly. Do not mix route logic into service files or vice versa.
- All route input/output must have **explicit Elysia schemas** defined in `model.ts`. Never leave a route unvalidated.
- Use **`derive`** (not `beforeHandle`) to decode JWT and inject `userId` or other auth context into the handler context.
- Use **`beforeHandle`** only for pure guard logic (early returns, rate limiting). It must never return data meant for the handler.
- Never access `decoded.userId` inside a handler — it must come through `derive` so it is typed in context.
- Group related routes under a scoped `Elysia` instance and use `.use()` composition — never register everything on the root app.
- Always define `response` schemas on routes. Every status code the route can return must be covered.
- Errors must be thrown using the project's `MyError` class — never use raw `new Error()` in route or service files.

---

## 4. Service Layer Rules

- Services must be **pure business logic** — no HTTP concepts (`set.status`, `headers`, etc.) inside a service file.
- Services must not import from Elysia directly.
- Every service method must have an explicit return type.
- Async generators used for streaming must follow the `AsyncGenerator<YieldType>` return type signature.
- Usage of `yield*` is preferred over manual `for await + yield` loops when delegating to another generator.
- Callbacks (e.g. `onUsage`) must be typed with a named type — never inline anonymous object types in function signatures.

---

## 5. Streaming Rules

- All streaming routes must return a `Response` with a `ReadableStream` — never buffer the full response.
- SSE events must follow the format: `data: ${JSON.stringify(payload)}\n\n`
- Every streaming route must send a final event with `{ done: true, usage: ... }` before closing the controller.
- Always call `controller.close()` in a `finally` block — never leave the stream open on error.
- Token usage (`promptTokens`, `completionTokens`, `totalTokenCount`) must be captured via callback and sent in the final SSE event — never lost.

```typescript
// Required streaming pattern
const readable = new ReadableStream({
  async start(controller) {
    try {
      for await (const chunk of service.stream(...)) {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text: chunk })}\n\n`));
      }
      controller.enqueue(encoder.encode(`data: ${JSON.stringify({ done: true, usage })}\n\n`));
    } catch (err) {
      controller.error(err);
    } finally {
      controller.close();
    }
  }
});
```

---

## 6. Error Handling Rules

- **Every `async` function must have a `try/catch`** — no unhandled promise rejections.
- Use the project's `MyError(statusCode, message)` class for all thrown errors in routes and services.
- Never expose raw error messages or stack traces to the client. Log with `console.error(err)` internally, return a safe message externally.
- Catch blocks must never be empty. At minimum: `console.error(err); throw new MyError(...)`.
- Separate concerns with **multiple try/catch blocks** when a route does multiple independent async operations (e.g. validate key, then call AI, then save transaction).
- Always validate that external API responses have the expected shape before accessing nested fields.

---

## 7. Database & Prisma Rules (`packages/db-config`)

- All Prisma queries must be inside a `try/catch`.
- Never run raw SQL unless Prisma cannot express the query, and only after explicit justification in a comment.
- Always select only the fields you need — never return full Prisma models to the client.
- Transactions (`prisma.$transaction`) are required when two or more writes must be atomic.
- Never expose the Prisma client instance outside of `packages/db-config` — import only typed repository functions or service helpers.
- Schema changes must always be accompanied by a migration — never edit the schema without running `prisma migrate dev`.

---

## 8. Environment Variables (`packages/env-config`)

- **Never** hardcode secrets, API keys, URLs, or environment-specific values anywhere in the codebase.
- All env vars must be declared and validated in `packages/env-config` before use.
- Never access `process.env.X` directly in app code — always import from `packages/env-config`.
- If a required env var is missing, the app must **fail fast at startup** with a clear error — not at runtime during a request.

---

## 9. Authentication & Security Rules

- JWT verification must always happen in `derive` — never trust a token without calling `jwt.verify()`.
- Never log JWT tokens, API keys, or any secret material.
- API keys must always be stored **hashed** — never store plaintext keys in the database.
- Every protected route must have auth validation. There are no exceptions for "internal" routes in production.
- Rate limiting must be applied to all public-facing routes.
- Never return `userId`, internal IDs, or database primary keys in error messages.

---

## 10. Frontend Rules (`apps/web` — React Router v7+)

- Follow the React Router v7+ data API — use `loader` and `action` functions, not `useEffect` for data fetching.
- All API calls must go through `services/` — never call `fetch` directly in a component.
- Components must not contain business logic — extract to hooks or service files.
- All streamed responses must be consumed chunk by chunk — never buffer a streaming response in the frontend.
- Types shared between frontend and backend must live in `packages/` — never duplicate them.

---

## 11. Code Style & Formatting

- **Prettier and ESLint are non-negotiable.** Every file saved must pass both — this is enforced in the pre-commit hook via `pnpm test`.
- No commented-out code in commits. Use `// TODO:` with a description if something is deferred.
- No `console.log` in committed code — use `console.error` for errors only, and remove debug logs before committing.
- Imports must be ordered: external packages → internal packages → relative imports. Use the ESLint import plugin to enforce this.
- File names: `kebab-case` for files, `PascalCase` for classes and React components, `camelCase` for functions and variables.

---

## 12. Module Pattern Enforcement

Every module under `modules/` must follow this exact structure:

```
modules/
  <feature>/
    index.ts     ← route definitions only, imports from model.ts and service.ts
    model.ts     ← Elysia schemas (t.Object, etc.) and their inferred types
    service.ts   ← business logic, database calls, external API calls
```

- `index.ts` must not contain business logic.
- `model.ts` must not contain business logic or database calls.
- `service.ts` must not import Elysia or define routes.
- If a feature needs a helper, create a `utils.ts` inside the module — do not pollute the top-level `utils/`.

---

## 13. Sync & Build Rules

- Always run `pnpm build` from the root after changing any `packages/*` — downstream apps must reflect the change.
- Never import from a package's `src/` directly — always import from its built output or declared exports.
- Turbo cache is enabled — if a change is not reflected, run `turbo run build --force`.
- When adding a new package to the monorepo, register it in the root `pnpm-workspace.yaml` and add it to the relevant `turbo.json` pipeline.
- `packages/db-config` and `packages/env-config` must be built before any app starts. The `dev` script order in `turbo.json` must reflect this.

---

## 14. Git & Pre-commit Rules

- The pre-commit hook runs `pnpm check-types && pnpm lint && pnpm format`. **All three must pass** before a commit is accepted.
- Never use `--no-verify` to bypass the hook.
- Commit messages must follow the format: `type(scope): short description` — e.g. `feat(api): add streaming completions route`.
- Valid types: `feat`, `fix`, `chore`, `refactor`, `docs`, `test`, `perf`.
- Each commit should represent one logical change. Do not bundle unrelated changes.

---

## 15. Human Review Checkpoints

The agent must **pause and ask for human review** before proceeding in these situations:

- Any change to `packages/db-config` schema or migrations.
- Any change to `packages/env-config` that adds, removes, or renames env vars.
- Any change to authentication or JWT logic.
- Any route that handles payments or API key generation/validation.
- Deleting or renaming any file that is imported by more than one module.
- Any change to `turbo.json` or root `package.json` scripts.
- Adding a new external dependency — justify it with: what it does, why an existing package can't be used, and its maintenance status.

---

## 16. What the Agent Must Never Do

- Never remove or bypass error handling to "simplify" code.
- Never change a schema without updating the corresponding TypeScript type.
- Never write a route without a response schema.
- Never commit `.env` files or any file containing secrets.
- Never use `delete` on a Prisma model directly in a route handler — always go through the service layer.
- Never silence TypeScript errors with `any` or `@ts-ignore` as a shortcut.
- Never assume a `Promise` resolves successfully — always handle rejection.
- Never modify the `husky` pre-commit hook configuration without explicit human approval.