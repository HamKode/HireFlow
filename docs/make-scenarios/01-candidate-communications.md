# Scenario: Candidate Communications

Sends automated, respectful candidate emails at key pipeline stages. This is the one part of the recruitment pipeline that stays in Make.com rather than in the app, because it needs a real Gmail account's send permission — a credential only you can grant, inside Make.com's own connection manager, never pasted into this repo.

## What triggers it

The app itself calls this scenario's Custom Webhook directly — `src/lib/integrations/make.ts`, fired on every application create and status change — instead of a Supabase Database Webhook. (Supabase Database Webhooks hit a platform-side bug on this project — `schema "supabase_functions" does not exist` — so we route around it. See `docs/make-scenarios/README.md` for the full explanation.) `MAKE_APPLICATION_WEBHOOK_URL` in `.env.local` is that webhook's URL.

## Modules

**1. Custom Webhook** (trigger)
Name: `01 - Receive Application Status Event`
Add a webhook, copy its URL into `MAKE_APPLICATION_WEBHOOK_URL` in `.env.local`. Payload shape the app sends:
```json
{ "type": "INSERT" | "UPDATE", "table": "applications", "record": { ...new row... }, "old_record": { ...previous row or null... } }
```

**2. Router**
Name: `02 - Route By Status`
Branches (each a Filter on `record.status`, and for UPDATE events also check it actually *changed*: `record.status != old_record.status`):
- `applied` (only on INSERT) → Application Received
- `shortlisted` → Shortlisted
- `rejected` → Rejection
- `offer_sent` → Offer (wire up once Phase 6 adds the offers table flow)

**3. Supabase — Get a Row** (one per branch)
Name: `03 - Fetch Candidate + Job`
Use Make's Supabase app (connect with your project URL + service role key, stored in Make's own connection, not here) to fetch:
- `candidates` row by `record.candidate_id`
- `jobs` row by `record.job_id`

**4. Gmail — Send an Email**
Name: `04 - Send <Stage> Email`
From the connected Gmail account. Subject/body per branch — see templates below. Use Make's mapping panel to insert `candidate.full_name`, `job.title`, etc.

Optional personalization: add an **HTTP — Make a Request** module before this one, calling `POST {{APP_URL}}/api/ai/...` is not built for this — instead call Groq directly via HTTP module with your own prompt if you want a personalized opening line, then insert that single line into the template. Keep all legal/company content (deadlines, next steps, company name) in the static template — never let the AI invent policy details, per the project's fairness/accuracy rules.

**5. Supabase — Create a Row**
Name: `05 - Log Automation Event`
Insert into `automation_logs`:
```json
{
  "application_id": "{{record.id}}",
  "candidate_id": "{{record.candidate_id}}",
  "action": "EMAIL_SENT",
  "status": "success",
  "source": "make.com",
  "payload": { "template": "<stage>" }
}
```

**6. Error handler** (attach to the Gmail module: right-click → Add error handler)
Name: `06 - Handle Send Failure`
Route: Supabase — Create a Row → `automation_logs` with `status: "failure"`, `error_message: {{error.message}}`, then a Slack or Gmail-to-HR alert. Never let a failed send disappear silently.

## Email templates

**Application Received**
> Subject: We've received your application for {{job.title}}
> Hi {{candidate.full_name}}, thanks for applying to {{job.title}}. Our team reviews every application — we'll be in touch within [X] business days with next steps.

**Shortlisted**
> Subject: You've been shortlisted for {{job.title}}
> Hi {{candidate.full_name}}, good news — you've been shortlisted for {{job.title}}. We'll reach out shortly to schedule an interview.

**Rejection**
> Subject: Update on your application for {{job.title}}
> Hi {{candidate.full_name}}, thank you for your interest in {{job.title}} and for the time you invested in applying. After careful review, we've decided to move forward with other candidates. We'll keep your profile on file for future roles that match your background.

Keep rejection copy exactly this neutral — no AI-generated reasoning about *why*, since that risks introducing unreviewed, potentially non-compliant claims into a legally sensitive communication.

## Setup checklist for you

1. ✅ Free Make.com account → new scenario → Custom Webhook module, URL copied into `MAKE_APPLICATION_WEBHOOK_URL`.
2. ✅ Confirmed the app can reach it (`automation_logs` shows `MAKE_WEBHOOK_NOTIFIED` / success on a real test application).
3. ✅ Supabase connection added in Make (project URL + service role key, stored inside Make).
4. ✅ Gmail connection added (OAuth).
5. ✅ Router → filter (`record.status = applied`) → Supabase (candidates) → Supabase (jobs) → Gmail built for the **Application Received** branch.
6. ✅ Error handler attached to the Gmail module (logs failures to `automation_logs`).
7. ✅ Sent a real test application and confirmed the email arrived in a real inbox.
8. ✅ Scenario turned **ON** (no longer just "Run once" — it fires automatically now).

**Live and working.** The `Shortlisted` and `Rejection` branches (filters + Supabase lookups + Gmail, same pattern as above) are documented but not built yet — add them the same way, on your own schedule, whenever you're ready to wire up automated emails for those stages too. They aren't required for the pipeline to keep working.
