import 'server-only';
import { createClient } from '@/lib/supabase/server';

export async function listOnboardingTasks() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('onboarding_tasks')
    .select('*, candidate:candidates(id, full_name), assignee:profiles(id, full_name)')
    .order('candidate_id')
    .order('created_at');
  if (error) throw error;
  return data;
}
