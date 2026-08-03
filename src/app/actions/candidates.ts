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
  const user = await requireRole('admin', 'hr_manager', 'recruiter');

  const full_name = String(formData.get('full_name') ?? '').trim();
  const email = String(formData.get('email') ?? '').trim();

  if (!full_name || !email) {
    return { error: 'Full name and email are required.' };
  }

  const supabase = await createClient();
  const { data: existing } = await supabase
    .from('candidates')
    .select('id')
    .eq('email', email)
    .eq('organization_id', user.profile.organization_id)
    .maybeSingle();
  if (existing) {
    return { error: 'DUPLICATE_CANDIDATE: a candidate with this email already exists.' };
  }

  const { data, error } = await supabase
    .from('candidates')
    .insert({
      organization_id: user.profile.organization_id,
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

// Deletes the candidate and everything that hangs off them (applications,
// scores, interviews, feedback, offers, onboarding tasks all cascade via FK
// on the DB side). automation_logs rows survive with candidate_id set to
// null — the audit trail outlives the record it was about. Storage files
// (resume, offer PDFs) aren't covered by DB cascade, so they're cleaned up
// explicitly first.
export async function deleteCandidate(candidateId: string) {
  const user = await requireRole('admin', 'hr_manager', 'recruiter');
  const supabase = await createClient();

  const { data: candidate } = await supabase
    .from('candidates')
    .select('full_name, email, resume_url')
    .eq('id', candidateId)
    .single();

  const { data: offers } = await supabase.from('offers').select('pdf_url').eq('candidate_id', candidateId);

  const resumePaths = candidate?.resume_url ? [candidate.resume_url] : [];
  const offerPaths = (offers ?? []).map((o) => o.pdf_url).filter((p): p is string => !!p);

  if (resumePaths.length) await supabase.storage.from('resumes').remove(resumePaths);
  if (offerPaths.length) await supabase.storage.from('offer-letters').remove(offerPaths);

  await supabase.from('automation_logs').insert({
    organization_id: user.profile.organization_id,
    candidate_id: candidateId,
    action: 'CANDIDATE_DELETED',
    status: 'success',
    source: 'dashboard',
    payload: { full_name: candidate?.full_name, email: candidate?.email },
  });

  const { error } = await supabase.from('candidates').delete().eq('id', candidateId);
  if (error) throw error;

  revalidatePath('/candidates');
  redirect('/candidates');
}

export async function updateResumeText(candidateId: string, formData: FormData) {
  await requireRole('admin', 'hr_manager', 'recruiter');
  const resumeText = String(formData.get('resume_raw_text') ?? '');

  const supabase = await createClient();
  const { error } = await supabase
    .from('candidates')
    .update({ resume_raw_text: resumeText || null })
    .eq('id', candidateId);
  if (error) throw error;

  revalidatePath(`/candidates/${candidateId}`);
}
