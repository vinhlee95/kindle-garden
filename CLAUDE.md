# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
pnpm dev          # Start dev server (http://localhost:3000)
pnpm build        # Production build
pnpm lint         # Run ESLint

# Database migrations
pnpm drizzle-kit generate   # Generate migration from schema changes
pnpm drizzle-kit migrate    # Apply migrations to ./data/highlights.db
pnpm drizzle-kit studio     # Open Drizzle Studio (DB GUI)
```

## Environment Setup

Copy `.env.local.example` to `.env` and fill in:
- `TURSO_DATABASE_URL` — libSQL database URL (use `file:./data/highlights.db` for local dev, or `libsql://...` for Turso)
- `TURSO_AUTH_TOKEN` — auth token from Turso dashboard (not needed for local file)
- `OPENROUTER_API_KEY` — required for AI features (chat, deeper insight generation)
- `OPENROUTER_MODEL` — defaults to `google/gemini-2.5-flash`
- `KINDLE_COOKIES` — browser cookies for read.amazon.com (required for Kindle sync)

**Note:** The project uses `.env` (not `.env.local`) as the environment file.

## Architecture

This is a Next.js 16 app for reviewing Kindle highlights using spaced repetition. The core loop: sync highlights from Kindle → review via SM-2 algorithm → deepen understanding with AI chat.

### Data Layer

- **Database**: SQLite via `@libsql/client` + Drizzle ORM (Turso-hosted in production, local file for dev)
- **Schema** (`src/lib/db/schema.ts`): Three tables — `books`, `highlights` (with SM-2 fields: `easeFactor`, `interval`, `repetitions`, `nextReview`), and `chat_messages`
- **Queries** (`src/lib/db/queries.ts`): All DB access goes through async query functions. No ORM query builders in route handlers — always use functions from this file.
- **Migrations**: Stored in `./drizzle/`. Run `drizzle-kit generate` after schema changes, then `drizzle-kit migrate`.

### API Routes (`src/app/api/`)

| Route | Method | Purpose |
|---|---|---|
| `/api/sync` | POST | Fetches highlights from Kindle notebook page and upserts into DB |
| `/api/highlights` | GET/POST | List highlights (paginated, filterable by bookId) / bulk import |
| `/api/highlights/[id]` | GET | Single highlight with chat history |
| `/api/books` | GET | List all books |
| `/api/review` | GET | Fetch due cards (where `nextReview <= today`) |
| `/api/review` | POST | Submit grade (1-5), updates SM-2 state |
| `/api/ai/chat` | POST | Streaming chat about a highlight via OpenRouter |
| `/api/ai/deeper` | POST | Generate and save a "deeper insight" for a highlight |
| `/api/export` | GET | Export highlights as JSON or Markdown |

### Key Libraries

- **SM-2** (`src/lib/sm2.ts`): Pure implementation of the SM-2 spaced repetition algorithm. `sm2(state, grade)` returns new `{easeFactor, interval, repetitions, nextReview}`.
- **Kindle scraper** (`src/lib/kindle.ts`): Fetches `https://read.amazon.com/notebook` using `KINDLE_COOKIES` and parses HTML with regex. Fragile — depends on Amazon's HTML structure.
- **OpenRouter** (`src/lib/openrouter.ts`): Thin wrapper around OpenRouter API. Supports streaming (returns raw Response) and non-streaming (returns string).

### Client State

TanStack Query (`@tanstack/react-query`) manages all server state. The `Providers` component wraps the app with `QueryClientProvider`. Custom hooks in `src/hooks/` encapsulate fetch logic:
- `useReviewCards` — fetches due highlights for review
- `useChat` — manages chat message streaming for a highlight
- `useDeeperInsight` — triggers and caches deeper insight generation

### Pages

- `/` — Daily review deck (SM-2 flashcard flow)
- `/highlights` — Browse all highlights with book filter
- `/highlights/[id]` — Single highlight detail with AI chat and deeper insight
- `/import` — Manual JSON import UI
- `/export` — Export highlights to JSON or Markdown

### UI

Shadcn/ui components (Radix UI primitives + Tailwind). Component config in `components.json`. Tailwind v4 with `@tailwindcss/postcss`.

## Production Infrastructure

- **Hosting**: Vercel — project `book_highlights` under `vinhdev12-gmailcoms-projects`
  - Project ID: `prj_BpaaguZilLQ3FKaFACCmqCkf7qCV`
  - Org ID: `team_JfLZBUnJx2pOzJPbspeglzb0`
- **Database**: Turso — `kindle-garden` db at `libsql://kindle-garden-vinhle.aws-ap-northeast-1.turso.io`
- **CD**: GitHub Actions (`.github/workflows/deploy.yml`) triggers on push to `main`
  - Required GitHub secrets: `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID`
  - Required Vercel env vars: `TURSO_DATABASE_URL`, `TURSO_AUTH_TOKEN`, `OPENROUTER_API_KEY`, `OPENROUTER_MODEL`, `KINDLE_COOKIES`
