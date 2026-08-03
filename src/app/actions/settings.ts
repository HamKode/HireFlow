'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { requireRole } from '@/lib/auth/dal';

export type SettingsFormState = { error?: string; success?: boolean } | undefined;

export async function updateAppSettings(
  settingsId: string,
  organizationId: string,
  _prevState: SettingsFormState,
  formData: FormData
): Promise<SettingsFormState> {
  await requireRole('admin');

  const num = (key: string, fallback: number) => {
    const v = formData.get(key);
    return v ? Number(v) : fallback;
  };

  const weights = {
    skills: num('weight_skills', 35),
    experience: num('weight_experience', 25),
    technical: num('weight_technical', 20),
    education: num('weight_education', 10),
    portfolio: num('weight_portfolio', 10),
  };

  const supabase = await createClient();

  const { error: orgError } = await supabase
    .from('organizations')
    .update({ name: String(formData.get('company_name') ?? 'My Company').trim() || 'My Company' })
    .eq('id', organizationId);
  if (orgError) return { error: orgError.message };

  const { error } = await supabase
    .from('app_settings')
    .update({
      default_scoring_weights: weights,
      default_interview_duration_minutes: num('default_interview_duration_minutes', 45),
      make_webhook_url: String(formData.get('make_webhook_url') ?? '').trim() || null,
    })
    .eq('id', settingsId);

  if (error) return { error: error.message };

  revalidatePath('/settings');
  return { success: true };
}
