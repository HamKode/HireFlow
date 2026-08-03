import 'server-only';
import type { SupabaseClient } from '@supabase/supabase-js';

const DEFAULT_TASKS = [
  { task_name: 'Collect signed documents', description: 'ID, tax forms, and any remaining paperwork.' },
  { task_name: 'Create employee account', description: 'Email, HRIS profile, and internal tooling access.' },
  { task_name: 'Assign manager', description: 'Confirm reporting line and introduce the manager.' },
  { task_name: 'Prepare equipment', description: 'Laptop and any role-specific hardware.' },
  { task_name: 'Schedule orientation', description: 'Book the new-hire orientation session.' },
  { task_name: 'Add to relevant systems', description: 'Payroll, benefits enrollment, Slack/communication tools.' },
];

export async function createDefaultOnboardingTasks(supabase: SupabaseClient, candidateId: string, offerId: string) {
  const rows = DEFAULT_TASKS.map((t) => ({
    candidate_id: candidateId,
    offer_id: offerId,
    task_name: t.task_name,
    description: t.description,
    status: 'pending' as const,
  }));

  const { error } = await supabase.from('onboarding_tasks').insert(rows);
  if (error) throw error;
}
