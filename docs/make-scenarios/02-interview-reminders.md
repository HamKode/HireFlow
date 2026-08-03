# Scenario: Interview Reminders

Sends 24-hour and 1-hour interview reminders, and chases interviewers who haven't submitted feedback after the interview time has passed. This is genuinely Make.com's job — it's time-based polling, not something that belongs in a Next.js request/response cycle (no cron runner in this app, and per the project's architecture Make.com owns scheduled automation).

This scenario is **optional** — the interview scheduling, AI questions, feedback form, and AI evaluation in the dashboard all work fully without it. This only adds the "nudge people automatically" layer on top.

## Trigger

There is no separate "Schedule" module/app to search for — scheduling is a property of the whole scenario, not a module. Instead:
1. The **first module** in the scenario is a regular action (Supabase — Search Rows below) that just runs fresh every time the scenario fires.
2. Scheduling itself is set via the small **clock icon** at the bottom of the scenario editor → "Run the scenario" → **At regular intervals** → every `15` minutes.

## Modules — 24-hour reminder branch ✅ built and verified

**1. Supabase — Search Rows**
Table: `interviews`
Filters (all AND'd together):
- `status` equals `scheduled`
- `scheduled_at` greater than or equal to `{{formatDate(addMinutes(now; 1425); "YYYY-MM-DDTHH:mm:ss.SSSZ")}}`
- `scheduled_at` less than or equal to `{{formatDate(addMinutes(now; 1455); "YYYY-MM-DDTHH:mm:ss.SSSZ")}}`

(1425 min = 23h45m, 1455 min = 24h15m — a window matching the 15-minute poll interval so nothing is sent twice or missed. The `formatDate()` wrap is required — Make's raw `addMinutes(now; …)` output isn't in the ISO format Supabase's REST API expects for a timestamp comparison, and fails with "expected a timestamp, but got a full date string" without it.)

**2. Supabase — Get a Row** ×2: `candidates` by the row's `candidate_id`, `jobs` by `job_id` (same pattern as `01-candidate-communications.md`). Mapping panel fields only appear after the module has run once with real matching data — if a field seems missing, run the scenario once against a real interview in the time window first.

**3. Gmail — Send an Email**
To candidate: reminder with date/time/meeting link.
To interviewer (if `interviewer_id` is set): same, framed as "you have an interview tomorrow."

**4. Supabase — Create a Row** → `automation_logs`: `action: "REMINDER_24H_SENT"`, `status: "success"`, plus `application_id`/`candidate_id` mapped from the Search Rows/candidate lookup (don't skip these — without them the audit trail isn't linked to anything).

Verified end-to-end with a real interview and a real inbox: email delivered, `automation_logs` correctly recorded `REMINDER_24H_SENT` with `application_id`/`candidate_id` populated.

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

## Error handling ✅ done

Attach an error handler to each Gmail module (right-click → Add error handler) → Supabase Create a Row with `status: "failure"`, `error_message: {{error.message}}` — same pattern as the candidate communications scenario. Never let a reminder silently fail to send without a trace in `automation_logs`.

## Setup checklist for you

1. ✅ Reused the existing Supabase and Gmail connections from the candidate communications scenario.
2. ✅ Built the 24h branch, tested against a real interview, confirmed the email arrived in a real inbox.
3. ✅ Error handler attached.
4. ✅ Scenario activated (ON).
5. The 1h branch and the feedback-request/follow-up branches (documented above) are **not built yet** — same pattern as the 24h branch, just different time-window filters and log actions. Build them the same way whenever you want that extra coverage; the scenario works correctly as-is without them.
