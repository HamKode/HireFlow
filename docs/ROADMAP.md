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

## Phase 4 — Application Intake, Resume Processing, Scoring, Routing ✅
- Claude: public `/apply/[jobId]` page + resume upload (Supabase Storage), deterministic PDF/DOCX/TXT text extraction, AI resume-profile extraction, duplicate detection, AI screening + deterministic scoring, routing to `hr_review` — all running natively (`src/lib/applications/intake.ts`), not through Make.com, since it's fully testable code and Make.com scenarios aren't something I can build or verify myself. Also: signed-URL resume viewing for HR, "copy application link" on published jobs, and a documented Make.com blueprint (`docs/make-scenarios/`) for the one piece that genuinely needs an external account — automated candidate emails via Gmail.
- You: built and activated the Make.com scenario yourself, step by step, following `docs/make-scenarios/01-candidate-communications.md` — Supabase + Gmail connections, Router/filter, field mapping, error handler, and turning the scenario ON.
- Verified: real multipart submission through the actual route end-to-end (resume uploaded to Storage, text extracted, AI profile + screening ran, application moved to `hr_review`, all `automation_logs` steps in correct order), duplicate-application handling confirmed, PDF worker bug found and fixed, Supabase Database Webhooks platform bug found and routed around (app calls Make.com's Custom Webhook directly instead), and the full live scenario tested end-to-end with a real inbox receiving the "Application Received" email.

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
