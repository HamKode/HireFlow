# Scenario: Candidate Communications

Sends automated, respectful candidate emails at key pipeline stages. This is the one part of the recruitment pipeline that stays in Make.com rather than in the app, because it needs a real Gmail account's send permission — a credential only you can grant, inside Make.com's own connection manager, never pasted into this repo.

## What triggers it

Set up a **Supabase Database Webhook** (Supabase dashboard → Database → Webhooks → Create a new hook):

| Hook | Table | Events | Condition |
|---|---|---|---|
| `applications-status-changed` | `applications` | Insert, Update | none — filter inside Make instead, so you can see all events while building |

Set the webhook URL to the Custom Webhook URL Make.com gives you in step 1 below (Make shows it before you activate the scenario — copy it into Supabase first, send one test row, confirm it arrives, then activate).

## Modules

**1. Custom Webhook** (trigger)
Name: `01 - Receive Application Status Event`
Add a webhook, copy its URL into the Supabase Database Webhook above. Supabase's payload shape:
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

1. Free Make.com account → new scenario → add the Custom Webhook module, copy its URL.
2. Supabase dashboard → Database → Webhooks → point a hook at that URL for the `applications` table.
3. In Make, add the Supabase connection (Settings → your project URL + service role key — stored inside Make, never in this repo).
4. Add the Gmail connection (OAuth, one click).
5. Build the Router + branches + templates above.
6. Send one real test application through `/apply/<jobId>` in the app and confirm the email arrives, then attach the error handler and activate the scenario.
