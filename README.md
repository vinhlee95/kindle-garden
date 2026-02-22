# kindle-garden

A personal app for growing your Kindle highlights into lasting knowledge. Sync highlights from your Kindle library, review them with spaced repetition (SM-2), and deepen your understanding with AI-powered chat.

## Features

- **Kindle sync** — pull highlights directly from read.amazon.com
- **Spaced repetition** — SM-2 flashcard review so you see highlights at the right time
- **AI chat** — ask questions about any highlight using an LLM via OpenRouter
- **Deeper insights** — generate and save an AI-written deeper analysis per highlight
- **Browse & filter** — view all highlights, filterable by book
- **Export** — download your highlights as JSON or Markdown

## Stack

- [Next.js 16](https://nextjs.org) (App Router)
- [Turso](https://turso.tech) (hosted SQLite) via `@libsql/client` + [Drizzle ORM](https://orm.drizzle.team)
- [TanStack Query](https://tanstack.com/query) for client state
- [shadcn/ui](https://ui.shadcn.com) + Tailwind v4
- [OpenRouter](https://openrouter.ai) for AI (defaults to `google/gemini-2.5-flash`)
- Deployed on [Vercel](https://vercel.com) via GitHub Actions CD

## Getting Started

### 1. Install dependencies

```bash
pnpm install
```

### 2. Configure environment

```bash
cp .env.local.example .env
```

Fill in:

| Variable | Required | Description |
|---|---|---|
| `TURSO_DATABASE_URL` | Yes | `libsql://...` for Turso, or `file:./data/highlights.db` for local dev |
| `TURSO_AUTH_TOKEN` | Yes (Turso) | Auth token from Turso dashboard |
| `OPENROUTER_API_KEY` | Yes (AI features) | Your OpenRouter API key |
| `OPENROUTER_MODEL` | No | Defaults to `google/gemini-2.5-flash` |
| `KINDLE_COOKIES` | Yes (Kindle sync) | Browser cookies from read.amazon.com |

To get `KINDLE_COOKIES`: log into [read.amazon.com/notebook](https://read.amazon.com/notebook) in your browser, open DevTools → Network, copy the `Cookie` header from any request.

### 3. Set up the database

```bash
pnpm drizzle-kit push   # push schema to Turso (or local file)
```

### 4. Run the dev server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

## Database

Uses [Turso](https://turso.tech) (hosted SQLite) in production. For local dev, set `TURSO_DATABASE_URL=file:./data/highlights.db` to use a local file instead.

After changing `src/lib/db/schema.ts`, run:

```bash
pnpm drizzle-kit generate   # generate migration
pnpm drizzle-kit push       # apply schema to Turso
pnpm drizzle-kit studio     # open DB GUI
```

## Deployment

Deployed to Vercel via GitHub Actions on every push to `main`. Required GitHub secrets: `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID`.
