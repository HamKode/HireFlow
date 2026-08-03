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

## Phase 5 — Interview Loop ✅
- Claude: interview scheduling UI (`/interviews`), AI interview-question generator (grounded in the candidate's actual resume/projects, not generic), interviewer feedback form, AI evaluation summaries (interviewer's own scores/recommendation stay human — AI only organizes and suggests a next step), status transitions (`interview_scheduled` → `interviewed`) wired into the same Make.com notifier from Phase 4, and a documented Make.com blueprint for 24h/1h reminders + feedback-request follow-ups (`docs/make-scenarios/02-interview-reminders.md`) — genuinely Make.com's job since it's time-based polling, not something Next.js should run.
- You: (optional) build the reminders scenario in Make.com whenever you want that layer; the dashboard interview flow works fully without it.
- Verified: both AI features tested against the real Groq API (questions correctly referenced the candidate's specific project, not generic filler); full DB pipeline tested end-to-end (schedule → AI questions → feedback → AI evaluation → status transitions → Make.com notified successfully at each step, confirmed via `automation_logs`).

## Phase 6 — HR Final Review, Offer, E-Signature, Onboarding ✅
- Claude: HR final-review actions (approve/another interview/hold/reject, every decision logged with who and why); approved-static-template offer letter PDF generation (`lib/pdf/offer-letter.ts`, pdf-lib — contractual terms never AI-generated); private `offer-letters` Storage bucket + signed-URL viewing; offer lifecycle (draft → sent → signed) with a "Mark as signed" demo button that runs the exact same cascade a real e-signature webhook would; `/api/webhooks/esignature` receiver; automatic onboarding checklist creation on signature; onboarding board (`/onboarding`) with per-task status; documented Make.com blueprint for real DocuSign/Dropbox Sign integration (`docs/make-scenarios/03-e-signature.md`).
- You: (optional) a free DocuSign or Dropbox Sign developer account if you want real e-signatures instead of the simulate button — the dashboard flow works fully without it.
- Verified: PDF generation round-tripped (generated → parsed back → exact text matched); the real `/api/webhooks/esignature` route tested end-to-end against a real seeded application — offer signed, application moved `interviewed → offer_pending → offer_sent → onboarding`, 6 onboarding tasks created, full `automation_logs` chain confirmed correct.

## Phase 7 — Analytics, Notifications, Settings ✅
- Claude: analytics dashboard (recruitment funnel, status/source bar charts, job/source performance tables, shortlist/interview/offer/hire rates, avg screening/interview scores, avg time-to-hire — computed from current `applications.status`, documented as a stage-reached proxy rather than a full historical trace); in-app notification bell (fan-out to the recruiting team on: candidate needs HR review, interview feedback submitted, offer signed) with mark-read; admin Settings page (company name used on offer letters, default scoring weights for new jobs, default interview duration) backed by a new `app_settings` table — falls back to hardcoded defaults gracefully if the migration hasn't run yet, so it never hard-fails. AI model/temperature stay env-var-configured (`GROQ_MODEL`), deliberately not moved into the dashboard, so changing models can never leak the API key through the UI. Audit Log viewer already shipped in Phase 2.
- You: run the `app_settings` SQL patch (given during the session) in the Supabase SQL editor.
- Verified: analytics aggregation tested against real seeded data (49 applications across 14 statuses, avg score correctly computed); notification fan-out tested against real profiles (inserts one row per recruiting-team member); settings fallback confirmed (queries the live DB, which doesn't have `app_settings` yet, and the app degrades to defaults instead of erroring).

## Phase 8 — Demo Data, Deploy, QA ✅ (data/QA) — deploy optional
- Claude: enriched demo data (found and removed leftover test-candidate cruft from earlier phase testing; added 2 more interviews with real AI-generated questions/feedback/evaluation, 2 more offers at draft/sent stages so all pipeline stages have a real example); final QA pass (`tsc --noEmit` clean, `npm run lint` clean — fixed one unescaped-entity warning, production build clean across all 29 routes, live smoke test of public/protected routes); refreshed README with the full feature list and corrected architecture description.
- You: (optional) a free Vercel account if you want this hosted rather than run locally — see the deployment section below.
- Verified: final demo data counts — 6 jobs, 51 candidates, 47 applications, 42 scores, 3 interviews (with feedback + AI evaluations), 3 offers (draft/sent/signed), 6 onboarding tasks, 66 automation log entries.

## Phase 9 — Multi-Tenancy ✅
Added after the initial 8 phases, once the plan became putting this in front of real HR teams (e.g. sharing publicly) rather than a single-company demo.

- Claude: full multi-tenant retrofit — a new `organizations` table; `organization_id` added to every table (jobs, candidates, applications, scores, interviews, feedback, offers, onboarding tasks, notifications, automation logs, settings); every RLS policy rewritten to filter by `current_organization_id()`; every service-role code path (public apply pipeline, AI routes, signed-URL routes, the e-signature webhook) updated to enforce tenant ownership explicitly, since service-role bypasses RLS entirely; candidate email uniqueness changed from global to per-organization (the same person can be a candidate at two different companies); `notifyRecruitingTeam` fixed to stop fanning out notifications across every tenant (a real bug caught before it shipped); signup now takes a company name and creates a brand-new organization per signup, with that user as its admin; `app_settings` moved from one global row to one per organization, with company name now living on `organizations.name`; optional per-org Make.com webhook URL (falls back to the platform-wide one).
- You: ran the migration SQL in the Supabase SQL editor (adds `organizations`, backfills all existing data into one default org so your account and demo data kept working unchanged, rewrites every policy).
- Verified: full typecheck/lint/build clean; migration confirmed against the live database (existing admin + all demo data correctly assigned to one default organization); real isolation test — created a second signup ("Totally Different Company Inc"), confirmed it saw **zero** of the original 6 jobs / 51 candidates / 47 applications, and could create and see its own data independently. Test tenant cleaned up after.

---
**Rule for every phase:** nothing moves to the next phase until the current one runs end-to-end without errors.
