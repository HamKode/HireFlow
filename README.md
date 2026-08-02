# HireFlow AI

AI-powered HR recruitment automation platform. Automates the full recruitment lifecycle — job creation, candidate application, resume parsing, AI screening, interview scheduling, offer generation, e-signature, and onboarding.

**Architecture**

```
Next.js (UI) → Supabase (system of record) → Make.com (orchestration) → Groq (AI) + external services → Supabase → Next.js
```

- **Next.js** — dashboard, candidate application forms, auth. No core automation logic lives here.
- **Supabase** — Postgres database, auth, storage, row-level security. Source of truth for all recruitment data.
- **Make.com** — orchestrates the recruitment pipeline via webhooks: resume processing, AI screening, interview scheduling, offers, onboarding. See [docs/make-scenarios/](docs/make-scenarios/).
- **Groq** — AI layer for job description generation, resume analysis, candidate scoring signals, interview questions, and evaluation summaries. All scoring math is deterministic backend logic — the LLM never assigns the final number.

**Build status:** see [docs/ROADMAP.md](docs/ROADMAP.md) for the phased build plan and current progress.

## Getting Started

```bash
npm install
cp .env.example .env.local   # fill in your own keys — see docs/SETUP.md
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Documentation

- [docs/ROADMAP.md](docs/ROADMAP.md) — phase-by-phase build plan
- [docs/SETUP.md](docs/SETUP.md) — accounts/keys you need to provision, and where they go
- [docs/make-scenarios/](docs/make-scenarios/) — Make.com scenario blueprints (added in Phase 4)
- [supabase/schema.sql](supabase/schema.sql) — database schema (added in Phase 1)
