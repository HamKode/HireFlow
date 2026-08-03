import 'server-only';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Application } from '@/lib/supabase/types';

// Fire-and-forget notification to the Make.com "Candidate Communications"
// scenario (docs/make-scenarios/01-candidate-communications.md). Same
// payload shape a Supabase Database Webhook would send, so the Make.com
// Router logic (branch on record.status) doesn't care which one is firing
// it - we call it directly because Supabase's own Database Webhooks feature
// hit a platform bug (missing `supabase_functions` schema) on this project.
export async function notifyApplicationEvent(
  supabase: SupabaseClient,
  event: {
    type: 'INSERT' | 'UPDATE';
    record: Application;
    oldRecord?: Partial<Application> | null;
  }
) {
  const url = process.env.MAKE_APPLICATION_WEBHOOK_URL;
  if (!url) return; // not configured — silently a no-op, core pipeline never depends on this

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: event.type,
        table: 'applications',
        record: event.record,
        old_record: event.oldRecord ?? null,
      }),
    });

    await supabase.from('automation_logs').insert({
      application_id: event.record.id,
      candidate_id: event.record.candidate_id,
      action: 'MAKE_WEBHOOK_NOTIFIED',
      status: res.ok ? 'success' : 'failure',
      source: 'make.com',
      payload: { status: event.record.status },
      error_message: res.ok ? null : `Make.com webhook responded ${res.status}`,
    });
  } catch (err) {
    await supabase.from('automation_logs').insert({
      application_id: event.record.id,
      candidate_id: event.record.candidate_id,
      action: 'MAKE_WEBHOOK_NOTIFIED',
      status: 'failure',
      source: 'make.com',
      error_message: err instanceof Error ? err.message : 'Failed to reach Make.com webhook.',
    });
  }
}
