# CLAUDE.md

## Gotchas

- Env file is `.env`, not `.env.local`
- Required env vars: `TURSO_DATABASE_URL`, `TURSO_AUTH_TOKEN`, `OPENROUTER_API_KEY`, `OPENROUTER_MODEL`, `KINDLE_COOKIES`
- All DB query functions in `src/lib/db/queries.ts` are async — always `await` them
- Route handlers must use query functions from `queries.ts`, no raw ORM calls
