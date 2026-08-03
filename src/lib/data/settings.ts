import 'server-only';
import { createClient } from '@/lib/supabase/server';
import type { ScoringWeights } from '@/lib/scoring/weighted-score';

export type AppSettings = {
  id: string;
  company_name: string;
  default_scoring_weights: ScoringWeights;
  default_interview_duration_minutes: number;
};

export async function getAppSettings(): Promise<AppSettings> {
  const supabase = await createClient();
  const { data, error } = await supabase.from('app_settings').select('*').limit(1).single();
  if (error || !data) {
    // Falls back if the app_settings migration hasn't been run yet — the app
    // should never hard-fail just because this optional config is missing.
    return {
      id: '',
      company_name: 'HireFlow AI',
      default_scoring_weights: { skills: 35, experience: 25, technical: 20, education: 10, portfolio: 10 },
      default_interview_duration_minutes: 45,
    };
  }
  return data as AppSettings;
}
