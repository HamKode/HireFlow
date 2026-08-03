# Make.com Scenarios

Everything in the core recruitment pipeline — application intake, resume parsing, AI screening, deterministic scoring, routing — already runs natively in this app (`src/lib/applications/intake.ts`, `src/lib/ai/`). It didn't need Make.com: it's typed, testable, and runs in the same request as the candidate's submission instead of round-tripping through a third-party workflow tool.

What genuinely needs Make.com is **anything that requires an external service account this codebase can't hold on its own** — specifically, sending real emails from a real mailbox. That's [`01-candidate-communications.md`](01-candidate-communications.md).

## How the trigger works

The original plan was a **Supabase Database Webhook** (Database → Webhooks) posting straight to Make.com's Custom Webhook on every insert/update — no app code involved. In practice, Supabase Database Webhooks depend on an internal `supabase_functions` schema that isn't provisioned on every project (a platform-side bug, not a schema/config issue we can fix from here), so that path failed with `schema "supabase_functions" does not exist`.

Instead, the app calls the Make.com Custom Webhook directly — `src/lib/integrations/make.ts`, fired from `processApplicationIntake` (on `applied`) and `updateApplicationStatus` (on any dashboard status change). It sends the exact same payload shape a Supabase Database Webhook would have (`{ type, table, record, old_record }`), so the Router logic in the scenario below is unaffected — only the trigger mechanism changed. Every call logs a `MAKE_WEBHOOK_NOTIFIED` row to `automation_logs` (success or failure) so a silent failure is never invisible.

If Supabase fixes the underlying bug on your project later, switching back to a Database Webhook is a config change in the Supabase dashboard, not a code change — the payload shape Make.com receives stays identical either way.

## Adding more scenarios later

Interview reminders (Phase 5) and offer/e-signature notifications (Phase 6) follow the same shape: notify from the relevant app code → Make.com Custom Webhook → Router by event type → Gmail/Slack → write an `automation_logs` row for the audit trail. Add them as `02-*.md`, `03-*.md` here when those phases land.
