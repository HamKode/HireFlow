# HireFlow AI — Build Roadmap

Each phase is completed, tested, and committed before the next one starts. "Claude" = built in this repo automatically. "You" = requires an account/credential only you can create (all free-tier where available).

## Phase 0 — Project Foundation ✅
- Claude: Next.js (TS, Tailwind, App Router) scaffold, repo structure, GitHub remote, initial commit.
- You: nothing yet.

## Phase 1 — Database Foundation
- Claude: Supabase SQL schema (`supabase/schema.sql`) — users, jobs, candidates, applications, candidate_scores, interviews, interview_feedback, offers, onboarding_tasks, notifications, automation_logs. Relationships, indexes, RLS policies, roles.
- You: create a free Supabase project at supabase.com, run the SQL in the SQL editor, copy the Project URL + anon key + service role key into `.env.local`.

## Phase 2 — Auth, Dashboard Shell, Core CRUD
- Claude: Supabase Auth wiring, role-based access (Admin/HR Manager/Recruiter/Hiring Manager/Interviewer), dashboard layout/nav, Jobs/Candidates/Applications CRUD pages, demo data seed script.
- You: run `npm run dev`, create your first user, sanity-check the UI.

## Phase 3 — Groq AI Layer
- Claude: centralized AI config, JD generator, resume analysis, structured JSON schemas + validation, deterministic weighted scoring engine, API routes Make.com will call.
- You: create a free Groq API key at console.groq.com, add `GROQ_API_KEY` to `.env.local`.

## Phase 4 — Make.com Automation (Scenarios 01–05)
- Claude: documented, importable Make.com blueprints for job description generation, application intake, resume processing + AI screening, candidate scoring, and candidate routing/HR notification.
- You: create a free Make.com account, import the blueprints, connect your own Supabase/Groq/Gmail credentials inside Make, activate the scenarios.

## Phase 5 — Interview Loop (Scenarios 06–08)
- Claude: interview scheduling UI, feedback form, AI interview-question generator, AI evaluation summaries, Make blueprints for scheduling/reminders/feedback.
- You: connect Google Calendar/Gmail inside Make.com.

## Phase 6 — Offer, E-Signature, Onboarding (Scenarios 09–12)
- Claude: offer letter template + PDF generation endpoint, e-signature webhook receiver, onboarding task automation.
- You: create a free DocuSign or Dropbox Sign developer account, connect it in Make.com.

## Phase 7 — Analytics, Audit Log, Notifications, Settings (Scenarios 13–14)
- Claude: analytics dashboard (charts), audit log viewer, notification center, admin settings (AI config, scoring weights, templates).
- You: review.

## Phase 8 — Demo Data, Deploy, QA
- Claude: realistic demo dataset, deployment config, final pass through the full pipeline.
- You: free Vercel account for hosting (optional — can also run locally for a demo).

---
**Rule for every phase:** nothing moves to the next phase until the current one runs end-to-end without errors.
