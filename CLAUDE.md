# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

Monorepo for a job scraping and matching platform. The backend scrapes job listings, matches them to users via fuzzy string matching, and sends WhatsApp notifications. The frontend is a Next.js app that consumes the backend API.

## Commands

### Infrastructure (Docker Compose)
```bash
make up          # Start all services in background
make down        # Stop all services
make build       # Rebuild images (no cache)
make logs        # Follow logs
make status      # Check container status
make sync        # Trigger global job sync (calls POST /sync-global)
make shell-backend  # Open shell inside backend container
make shell-db    # Open psql inside database container
make clean       # DESTRUCTIVE: removes containers, networks, and volumes
```

### Frontend (run inside `frontend/`)
```bash
npm run dev      # Dev server
npm run build    # Production build
npm run lint     # ESLint
```

## Architecture

### Services (docker-compose.yml)
- **db** — PostgreSQL 15, database `vagas`
- **backend** — FastAPI on port 8000, auto-reloads via uvicorn `--reload`
- **frontend** — Next.js on port 3000, `NEXT_PUBLIC_API_URL=http://localhost:8000`
- **evolution** — Evolution API (WhatsApp gateway) on port 8080
- **redis_evolution** — Redis 7, used only by Evolution API

### Backend (`backend/`)

Layered architecture: `main.py → services/ → crud/ → database.py`

**Key flows:**
1. `POST /users` → creates user with skills and match threshold
2. `POST /sync-global` → triggers background `run_scraping_task()` for predefined Brazilian tech terms
3. `run_scraping_task()` (worker.py) → calls Adzuna scraper → saves jobs → runs matcher for all users
4. Matcher (`services/matcher.py`) → fuzzy `token_set_ratio` on user skills vs job title+description → creates Recommendation → notifies via WhatsApp if phone present

**Scraping cache:** `services/scraper.py` checks `ScrapeHistory`; if a similar term (≥85% fuzzy match) was scraped within 6 hours, it skips the API call.

**Models:** `User`, `Job` (unique by URL), `Recommendation` (status: pending/applied/rejected), `ScrapeHistory`

**Scrapers** implement an abstract `BaseScraper` (`scrapers/base.py`). Currently only `AdzunaScraper` is implemented.

### Frontend (`frontend/`)

Next.js 15 App Router (`src/app/`). Uses MUI v7 + Emotion for styling. Currently minimal — only the default scaffold exists. Backend URL comes from `NEXT_PUBLIC_API_URL`.

## Environment Variables

**Backend** (create `backend/.env` or set in docker-compose):
```
DATABASE_URL=postgresql://postgres:postgres@db:5432/vagas
ADZUNA_APP_ID=
ADZUNA_APP_KEY=
WHATSAPP_API_URL=      # Evolution API base URL
WHATSAPP_API_KEY=      # Evolution API key
WHATSAPP_INSTANCE=     # Evolution instance name
```

**Frontend** (create `frontend/.env.local`):
```
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/health` | Health check |
| POST | `/users` | Create user |
| GET | `/users/{id}` | Get user |
| GET | `/users/{id}/recommendations` | Get matched jobs |
| POST | `/sync-global` | Trigger scraping for all default terms |
| GET | `/jobs` | List jobs (paginated, 100/page) |

## Adding a New Scraper

1. Create `backend/scrapers/<name>.py` extending `BaseScraper` (implement `scrape(term: str) -> list[JobCreate]`)
2. Instantiate it in `backend/worker.py` alongside `AdzunaScraper`

## Workflow

- Após concluir qualquer alteração solicitada, crie o commit automaticamente sem precisar ser pedido.

## AI Implementation Guidelines

When implementing changes via automated workflow (GitHub Actions):

- Follow the existing layered architecture: `main.py → services/ → crud/ → database.py`
- New scrapers must extend `BaseScraper` and be registered in `worker.py`
- New endpoints go in `main.py`, business logic in `services/`, DB access in `crud/`
- Do not introduce new dependencies without justification in the PR description
- Keep changes minimal and focused — do not refactor unrelated code
- Validate that new models/schemas are consistent with existing ones in `models.py` and `schemas/`
- If the change affects the DB schema, include the Alembic migration or note it explicitly in the PR
