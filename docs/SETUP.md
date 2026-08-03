# Setup — Accounts & Credentials

None of these can be created on your behalf — each needs a real account. All have free tiers sufficient for this project. Add every key to `.env.local` (never commit this file — it's already in `.gitignore`).

## Phase 1 — Supabase
1. Create a project at https://supabase.com (free tier).
2. Open the SQL editor, paste and run `supabase/schema.sql` (added in Phase 1).
3. Project Settings → API → copy:
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` key → `SUPABASE_SERVICE_ROLE_KEY` (server-side only, never expose to the browser)

## Phase 3 — Groq
1. Create an API key at https://console.groq.com/keys (free tier).
2. Add it as `GROQ_API_KEY` in `.env.local`.

## Phase 4 — Public application intake
Nothing required — the `/apply/[jobId]` page, resume upload, AI parsing/screening, and routing all run natively in this app. The `resumes` Supabase Storage bucket was already created programmatically.

**Optional** — real candidate emails via Make.com:
1. Create a free account at https://make.com.
2. Follow `docs/make-scenarios/01-candidate-communications.md` step by step (it's a full walkthrough, not just an import).
3. Connect Gmail and Supabase inside Make's own connection manager — credentials stay inside Make, not in this repo.

## Phase 6 — E-signature
1. Create a free developer account at https://www.docusign.com/developer-center or https://sign.dropbox.com.
2. Connect it inside the relevant Make.com scenario the same way as above.

## Phase 8 — Deployment (optional)
1. Free account at https://vercel.com.
2. Import this GitHub repo, add the same env vars from `.env.local` in the Vercel project settings.
