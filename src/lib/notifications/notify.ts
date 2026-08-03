import 'server-only';
import type { SupabaseClient } from '@supabase/supabase-js';

const RECRUITING_ROLES = ['admin', 'hr_manager', 'recruiter'];

// Fan-out: one dashboard notification row per recruiting-team member IN THE
// SAME ORGANIZATION ONLY - without the organization_id filter this would
// notify every tenant's admins for every other tenant's events, a serious
// cross-tenant leak. Kept simple (no per-user preferences yet) - see
// docs/make-scenarios for the Slack/email channels, which are separate from
// this in-app center.
export async function notifyRecruitingTeam(
  supabase: SupabaseClient,
  params: { organizationId: string; title: string; message: string; relatedApplicationId?: string }
) {
  const { data: profiles } = await supabase
    .from('profiles')
    .select('id')
    .eq('organization_id', params.organizationId)
    .in('role', RECRUITING_ROLES);
  if (!profiles || profiles.length === 0) return;

  const rows = profiles.map((p) => ({
    organization_id: params.organizationId,
    user_id: p.id,
    channel: 'dashboard' as const,
    title: params.title,
    message: params.message,
    related_application_id: params.relatedApplicationId ?? null,
  }));

  await supabase.from('notifications').insert(rows);
}
