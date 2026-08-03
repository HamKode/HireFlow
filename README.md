# HireFlow AI

AI-assisted, multi-tenant HR recruitment automation platform. Covers the full recruitment lifecycle — job creation, candidate application, resume parsing, AI screening, interview scheduling, feedback, offer letters, e-signature, and onboarding — with a human always in the loop on every hiring decision. Every company that signs up gets its own fully isolated workspace.

**Architecture**

```
Next.js (UI + application logic) → Supabase (system of record) → Groq (AI layer)
                                            ↓
                                   Make.com (notifications: email, reminders)
```

- **Next.js** — dashboard, candidate-facing application form, auth, and the recruitment pipeline itself (intake → resume parsing → AI screening → deterministic scoring → routing). This runs natively rather than through Make.com because it's typed, testable code that doesn't depend on a third-party account.
- **Supabase** — Postgres, Auth, Storage, row-level security. Source of truth for every table.
- **Groq** — job description generation, resume analysis, interview questions, interview evaluation. Every AI response is schema-validated; the LLM never computes a final score or makes a hiring decision — a human always does.
- **Make.com** — owns what genuinely needs an external account: candidate emails (Gmail), interview reminders (time-based polling), and an e-signature integration point. See [docs/make-scenarios/](docs/make-scenarios/).

**Build status:** all 9 phases complete — see [docs/ROADMAP.md](docs/ROADMAP.md) for what was built in each and how it was verified.

## Features

- **Multi-tenant** — signing up creates a brand-new, fully isolated organization (your own jobs, candidates, applications, everything) with you as its admin. Enforced at the database level via Supabase RLS on every table, not just in application code.
- **Jobs** — create/edit/publish/pause/close/duplicate, AI-assisted description generation (HR reviews before saving), public application link.
- **Candidates** — manual entry or via the public apply form; AI resume parsing extracts skills/experience/education from an uploaded PDF/DOCX/TXT.
- **Applications** — pipeline view, status tracking, AI screening + deterministic weighted scoring, HR final-review actions (approve/hold/reject/re-interview).
- **Interviews** — scheduling, AI-generated questions grounded in the candidate's actual resume, interviewer feedback form, AI evaluation summary.
- **Offers** — PDF generation from an approved template, e-signature (simulated in-app or via a real DocuSign/Dropbox Sign integration through Make.com).
- **Onboarding** — auto-created task checklist when an offer is signed.
- **Analytics** — recruitment funnel, source/status breakdowns, job/source performance, hire rate, time-to-hire.
- **Notifications & audit log** — in-app notification bell for the recruiting team; every automated action is logged to `automation_logs`.
- **Settings** — company name, default scoring weights, default interview duration (admin-only).
- **Roles** — Admin, HR Manager, Recruiter, Hiring Manager, Interviewer, enforced via Supabase RLS.

## Getting Started

```bash
npm install
cp .env.example .env.local   # fill in your own keys — see docs/SETUP.md
npm run seed                 # optional: realistic demo data (5 jobs, 50 candidates)
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Documentation

- [docs/ROADMAP.md](docs/ROADMAP.md) — phase-by-phase build plan and what was verified in each
- [docs/SETUP.md](docs/SETUP.md) — accounts/keys you need to provision, and where they go
- [docs/make-scenarios/](docs/make-scenarios/) — Make.com scenario blueprints (candidate emails, interview reminders, e-signature)
- [supabase/schema.sql](supabase/schema.sql) — full database schema, RLS policies, and helper functions
