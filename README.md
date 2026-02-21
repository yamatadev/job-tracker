# 🎯 Remote Job Tracker

A full-stack job aggregation platform that scrapes remote developer positions from multiple sources, tracks your application pipeline, and generates AI-powered cover letters.

![Dashboard Screenshot](./docs/dashboard.png)

## Why I Built This

As a developer exploring international remote opportunities, I was spending hours checking job boards. This tool automates the search, centralizes tracking, and uses AI to generate personalized cover letters — turning job hunting into a streamlined pipeline.

## Features

- **Secure Authentication** — JWT login with httpOnly cookies and protected routes
- **Multi-Source Scraping** — Aggregates remote dev jobs from RemoteOK and Arbeitnow
- **Smart Filtering** — Search by title/company/tags, filter by status and source
- **Application Pipeline** — Track jobs through New → Saved → Applied → Interview → Offer
- **AI Cover Letters** — Generate personalized cover letters with one click (GPT-4o-mini)
- **Scraping Dashboard** — Run scrapers on-demand with execution history
- **Fully Responsive** — Card-based layouts that work on any screen size

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Framework** | Next.js 15 (App Router) + TypeScript |
| **Database** | PostgreSQL + Prisma ORM |
| **Auth** | JWT (jose) + bcrypt + httpOnly cookies |
| **Scraping** | Axios + public job board APIs |
| **AI** | OpenAI API (GPT-4o-mini) |
| **Styling** | Tailwind CSS v4 |
| **Infrastructure** | Docker, Vercel, Neon |

## Getting Started

### Prerequisites
- Node.js 18+ · Docker · Git

### Setup
```bash
git clone https://github.com/yamatadev/job-tracker.git
cd job-tracker
npm install
docker compose up -d
cp .env.example .env
npx prisma migrate dev
npx prisma db seed
npm run scrape   # Fetch initial jobs
npm run dev
```

Open http://localhost:3000 — Login: admin@jobtracker.com / admin123

## License

MIT