# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

Bun + Turborepo monorepo: `apps/web` (TanStack Start on Cloudflare Workers, D1), `packages/db`, `packages/services`.
Request flow: route → tRPC router (`apps/web/src/server/trpc/routers/`) → service (`@repo/services/<module>`) → query functions (`@repo/db/<module>`).

## Commands

- Use `bun`, not npm/pnpm. Run from the root: `bun run dev`, `bun test`, `bun run check` (Ultracite lint + typecheck), `bun run fix`.
- One test: run inside the package (`cd packages/services && bun test src/<file>.test.ts`, or `bun test -t "name"`). Root `bun test` runs everything.
- `bun run dev` applies migrations and seed itself, so a stale local DB is not the cause of odd data. The DB lives in `apps/web/.wrangler`; delete it for a clean slate.

## Rules

**Browser code may import only `@repo/db/shared`.**
Every other `@repo/db` entry imports drizzle. A route component that imports one drags drizzle into the client bundle. Types or limits the UI needs go in `packages/db/src/shared.ts`.

**No barrel files; one `exports` entry per module.**
A new table or service needs its own `src/<name>.ts` plus a line in that package's `package.json` `exports`. Imports like `@repo/db/foo` will not resolve otherwise.

**A new service must also be added in `apps/web/src/server/trpc/context.ts`.**
That file is the only place `env.DB` is read and services are built per call. Nothing else may touch `env` or bindings. This is what keeps services runnable from tests.

**There is no auth. `ctx.userId` is always null.**
`protectedProcedure` therefore always returns 401, so don't use it for team features. Mutations take `actorId` as input, and the service checks it with `requireMember`/`requireAdmin` (`packages/services/src/members.ts`). Take the acting member id as the first argument of a service mutation.

**Services validate; the db layer does not.**
Export the zod schema from the service. The router passes it to `.input()` and the service parses it again, so callers that skip tRPC are still safe. Methods stay `async` so validation errors reject instead of throwing synchronously. Failures must be `ServiceError` subclasses (`NotFoundError`, `ValidationError`, `ConflictError`, `ForbiddenError`), because `init.ts` maps them to HTTP status codes. A plain `Error` becomes a 500.

**Keep routers thin: input schema, one service call.**
Business rules in a router are skipped by tests, which exercise services directly.

**`@repo/db` functions take the `Database` type, not a D1 handle, and return plain JSON.**
The same code runs on D1 in the Worker and on `bun:sqlite` in tests. Return string ids and ISO dates; don't leak stored row types, since tRPC serializes everything as JSON.
Templates: `packages/db/src/notes.ts`, `bookings.ts`; `packages/services/src/notes.ts`.

**Schema changes: edit `packages/db/src/schema.ts`, then `cd packages/db && bun run generate`.**
Commit `migrations/` including `migrations/meta/`. Drizzle diffs against that snapshot, and without it the next generate recreates the tables. Wrangler applies migrations, not drizzle-kit (`bun run db:apply`).

**Tests need no mocks.**
Each gets a fresh in-memory DB with the real migrations (`createTestDatabase()` from `@repo/db/testing`, tests only). `packages/services/src/fixtures.ts` provides a small team and two rooms. A service test therefore also covers the queries and the schema.

**Don't hand-edit `apps/web/src/routeTree.gen.ts`.**
It is generated from `src/routes/` (`bun run generate-routes` in `apps/web`). The `#/*` alias maps to `apps/web/src/*`.

**In the web app, call tRPC through `getTrpc()` (`src/integrations/trpc/client.ts`).**
During SSR it runs the router in-process rather than over HTTP. Don't `fetch('/api/trpc')` from a loader.

**The pre-commit hook runs `ultracite fix` and re-stages files.**
A commit can differ from what you staged because of formatting. A lint error it can't fix aborts the commit.

**`bun run deploy` and `db:*:remote` need a Cloudflare login and a real D1 id in `apps/web/wrangler.jsonc`.**
Don't run them without the user's go-ahead.
