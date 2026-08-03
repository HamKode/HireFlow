# Scenario: Interview Reminders

Sends 24-hour and 1-hour interview reminders, and chases interviewers who haven't submitted feedback after the interview time has passed. This is genuinely Make.com's job — it's time-based polling, not something that belongs in a Next.js request/response cycle (no cron runner in this app, and per the project's architecture Make.com owns scheduled automation).

This scenario is **optional** — the interview scheduling, AI questions, feedback form, and AI evaluation in the dashboard all work fully without it. This only adds the "nudge people automatically" layer on top.

## Trigger

A **Schedule** module (not a webhook) — Make.com's own "run every N minutes" trigger:
1. Add module → search **"Schedule"** → **"Every X Minutes"** → set to `15`.

## Modules — 24-hour reminder branch

**1. Supabase — Search Rows**
Table: `interviews`
Filter: `status` in (`scheduled`, `confirmed`) AND `scheduled_at` between `now + 23h45m` and `now + 24h15m` (a window matching the 15-minute poll interval, so nothing is sent twice or missed).

**2. Iterator** (if Search Rows returns an array) → one email per row.

**3. Supabase — Get a Row** ×2: `candidates` by `interviews.application.candidate_id`, `jobs` by `interviews.application.job_id` (same pattern as `01-candidate-communications.md`).

**4. Gmail — Send an Email**
To candidate: reminder with date/time/meeting link.
To interviewer (if `interviewer_id` is set): same, framed as "you have an interview tomorrow."

**5. Supabase — Create a Row** → `automation_logs`: `action: "REMINDER_24H_SENT"`, `status: "success"`.

## Modules — 1-hour reminder branch

Duplicate the branch above with the filter window changed to `scheduled_at` between `now + 45m` and `now + 1h15m`, action `REMINDER_1H_SENT`.

## Modules — Feedback request + follow-up

**Feedback request** (fires once, shortly after the interview ends):
- Filter: `interviews.status` in (`scheduled`, `confirmed`) AND `scheduled_at + duration_minutes` is in the past (between 15 and 30 minutes ago) AND no matching row in `interview_feedback`.
- Gmail to the interviewer: "Please submit your feedback for `{{candidate.full_name}}`" with a link to `{{APP_URL}}/interviews/{{interviews.id}}`.
- Log `FEEDBACK_REQUEST_SENT`.

**Follow-up** (if still no feedback 24h later):
- Same filter, but the time window shifts to 24h–24h15m after the interview ended, still no `interview_feedback` row.
- Gmail to the interviewer (consider CC-ing their manager or HR).
- Log `FEEDBACK_FOLLOWUP_SENT`.

## Error handling

Attach an error handler to each Gmail module (right-click → Add error handler) → Supabase Create a Row with `status: "failure"`, `error_message: {{error.message}}` — same pattern as the candidate communications scenario. Never let a reminder silently fail to send without a trace in `automation_logs`.

## Setup checklist for you

1. Duplicate your existing Supabase and Gmail connections from the candidate communications scenario (Make lets you reuse a connection across scenarios — no need to reconnect).
2. Build the 24h branch first, test it against a real interview scheduled ~24h out, confirm the email arrives.
3. Duplicate for the 1h branch, then the feedback-request and follow-up branches.
4. Attach error handlers.
5. Activate the scenario.
