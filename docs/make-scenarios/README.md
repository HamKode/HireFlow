# Make.com Scenarios

Everything in the core recruitment pipeline — application intake, resume parsing, AI screening, deterministic scoring, routing — already runs natively in this app (`src/lib/applications/intake.ts`, `src/lib/ai/`). It didn't need Make.com: it's typed, testable, and runs in the same request as the candidate's submission instead of round-tripping through a third-party workflow tool.

What genuinely needs Make.com is **anything that requires an external service account this codebase can't hold on its own** — specifically, sending real emails from a real mailbox. That's [`01-candidate-communications.md`](01-candidate-communications.md).

## Why a Database Webhook, not polling

Make.com doesn't have a native "new Supabase row" trigger. Don't poll Supabase on a schedule for this — use **Supabase Database Webhooks** (Database → Webhooks in the Supabase dashboard), which POST to a URL the instant a row is inserted/updated. Point it at a Make.com **Custom Webhook** trigger and the scenario fires in real time.

## Adding more scenarios later

Interview reminders (Phase 5) and offer/e-signature notifications (Phase 6) follow the same shape: a Supabase Database Webhook on the relevant table → Make.com Custom Webhook → Router by event type → Gmail/Slack → write an `automation_logs` row for the audit trail. Add them as `02-*.md`, `03-*.md` here when those phases land.
