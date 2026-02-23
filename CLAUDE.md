# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Development
npm run dev              # Start dev server on http://localhost:3000
npm run build            # Generate Prisma client + Next.js production build
npm run start            # Start production server
npm run lint             # Run ESLint

# Database
docker compose up -d     # Start PostgreSQL on port 5433
npx prisma migrate dev   # Run pending migrations
npx prisma db seed       # Create default user (admin@jobtracker.com / admin123)
npx prisma studio        # Open Prisma Studio GUI

# Scraper
npm run scrape           # Run job scraper via CLI (tsx scripts/scrape.ts)
```

There are no tests in this project.

## Architecture

**Remote Job Tracker** is a Next.js 15 App Router application that aggregates remote tech jobs, tracks application pipeline stages, and generates AI-powered cover letters.

### Stack

- **Framework**: Next.js 15 (App Router, React 19, React Compiler enabled)
- **Database**: PostgreSQL 16 via Docker (port 5433), Prisma ORM
- **Auth**: Custom JWT (jose) + bcrypt, stored in httpOnly cookies — no NextAuth
- **AI**: Groq API (llama-3.3-70b-versatile) via OpenAI SDK compatibility (`OPENAI_API_KEY` env var holds the Groq key)
- **Styling**: Tailwind CSS v4
- **Language**: TypeScript (strict, path alias `@/*` → `./src/*`)

### Key Directories

```
src/
├── app/
│   ├── api/             # Route handlers (auth, jobs, scrape, cover-letter, stats)
│   ├── jobs/            # Jobs listing page
│   ├── scraper/         # Scraper control panel page
│   ├── cover-letters/   # Cover letter generation page
│   ├── login/           # Auth page (no layout wrapper)
│   └── page.tsx         # Dashboard with stats
├── components/
│   ├── auth-provider.tsx  # React Context for session + client-side route protection
│   ├── app-shell.tsx      # Layout wrapper (sidebar + mobile header)
│   └── ...
├── lib/
│   ├── scrapers/          # Modular scraper per source + orchestrator
│   ├── ai.ts              # Cover letter generation via Groq
│   ├── candidate-profile.ts  # Static candidate summary injected into AI prompts
│   ├── auth.ts            # JWT sign/verify helpers
│   ├── db.ts              # Prisma client singleton
│   └── jobs.ts            # Job save/upsert logic
prisma/
├── schema.prisma          # Models: User, Job, CoverLetter, ScrapeLog
└── seed.ts                # Creates admin user
scripts/
└── scrape.ts              # Standalone scraper CLI entry point
```

### Data Flow

**Authentication**: Login → `POST /api/auth/login` → JWT in httpOnly cookie → `AuthProvider` fetches `/api/auth/me` on mount → redirects unauthenticated users to `/login`.

**Job Scraping**: Scraper page or CLI → `POST /api/scrape` → `runAllScrapers()` → each scraper fetches a public API → `saveJobs()` upserts by URL (prevents duplicates) → logs to `ScrapeLog` table.

**Cover Letters**: `/api/cover-letter` checks DB cache first; on miss, calls Groq with job details + static candidate profile from `src/lib/candidate-profile.ts`, then stores result.

**Job Status Updates**: `PATCH /api/jobs/[id]` — sets `appliedAt` automatically when status transitions to `APPLIED`.

### Adding a New Job Source

1. Create `src/lib/scrapers/<source>.ts` implementing the `ScrapedJob` interface from `src/lib/scrapers/types.ts`
2. Register it in `src/lib/scrapers/index.ts` → `runAllScrapers()`
3. Add the new value to the `JobSource` enum in `prisma/schema.prisma` and run `npx prisma migrate dev`

### Environment Variables

```
DATABASE_URL          # PostgreSQL connection string
NEXTAUTH_SECRET       # JWT signing secret
OPENAI_API_KEY        # Groq API key (used with Groq base URL in src/lib/ai.ts)
```
