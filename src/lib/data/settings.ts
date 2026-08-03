import 'server-only';
import { createClient } from '@/lib/supabase/server';
import type { ScoringWeights } from '@/lib/scoring/weighted-score';

export type AppSettings = {
  id: string;
  organization_id: string;
  company_name: string;
  default_scoring_weights: ScoringWeights;
  default_interview_duration_minutes: number;
  make_webhook_url: string | null;
};

export async function getAppSettings(): Promise<AppSettings> {
  const supabase = await createClient();
  // RLS (app_settings_read) already scopes this to the caller's own
  // organization, so there's exactly one row to find.
  const { data, error } = await supabase.from('app_settings').select('*, organization:organizations(name)').single();
  if (error || !data) {
    // Falls back if the multi-tenant migration hasn't been run yet — the app
    // should never hard-fail just because this config is missing.
    return {
      id: '',
      organization_id: '',
      company_name: 'HireFlow AI',
      default_scoring_weights: { skills: 35, experience: 25, technical: 20, education: 10, portfolio: 10 },
      default_interview_duration_minutes: 45,
      make_webhook_url: null,
    };
  }

  const organization = data.organization as unknown as { name: string } | null;
  return {
    id: data.id,
    organization_id: data.organization_id,
    company_name: organization?.name ?? 'HireFlow AI',
    default_scoring_weights: data.default_scoring_weights,
    default_interview_duration_minutes: data.default_interview_duration_minutes,
    make_webhook_url: data.make_webhook_url,
  };
}
