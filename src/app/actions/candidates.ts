'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { requireRole } from '@/lib/auth/dal';

export type CandidateFormState = { error?: string } | undefined;

function parseList(raw: FormDataEntryValue | null): string[] {
  return String(raw ?? '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}

export async function createCandidate(
  _prevState: CandidateFormState,
  formData: FormData
): Promise<CandidateFormState> {
  await requireRole('admin', 'hr_manager', 'recruiter');

  const full_name = String(formData.get('full_name') ?? '').trim();
  const email = String(formData.get('email') ?? '').trim();

  if (!full_name || !email) {
    return { error: 'Full name and email are required.' };
  }

  const supabase = await createClient();
  const { data: existing } = await supabase.from('candidates').select('id').eq('email', email).maybeSingle();
  if (existing) {
    return { error: 'DUPLICATE_CANDIDATE: a candidate with this email already exists.' };
  }

  const { data, error } = await supabase
    .from('candidates')
    .insert({
      full_name,
      email,
      phone: String(formData.get('phone') ?? '').trim() || null,
      location: String(formData.get('location') ?? '').trim() || null,
      linkedin_url: String(formData.get('linkedin_url') ?? '').trim() || null,
      github_url: String(formData.get('github_url') ?? '').trim() || null,
      portfolio_url: String(formData.get('portfolio_url') ?? '').trim() || null,
      years_experience: formData.get('years_experience') ? Number(formData.get('years_experience')) : null,
      education: String(formData.get('education') ?? '').trim() || null,
      technical_skills: parseList(formData.get('technical_skills')),
    })
    .select('id')
    .single();

  if (error) return { error: error.message };

  revalidatePath('/candidates');
  redirect(`/candidates/${data.id}`);
}
