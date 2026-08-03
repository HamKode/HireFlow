'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { requireRole } from '@/lib/auth/dal';
import type { EmploymentType, JobStatus } from '@/lib/supabase/types';

export type JobFormState = { error?: string } | undefined;

function parseSkills(raw: FormDataEntryValue | null): string[] {
  return String(raw ?? '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}

function jobPayloadFromForm(formData: FormData) {
  return {
    title: String(formData.get('title') ?? '').trim(),
    department: String(formData.get('department') ?? '').trim() || null,
    location: String(formData.get('location') ?? '').trim() || null,
    employment_type: (String(formData.get('employment_type') ?? 'full_time') as EmploymentType),
    salary_min: formData.get('salary_min') ? Number(formData.get('salary_min')) : null,
    salary_max: formData.get('salary_max') ? Number(formData.get('salary_max')) : null,
    experience_required: String(formData.get('experience_required') ?? '').trim() || null,
    education: String(formData.get('education') ?? '').trim() || null,
    required_skills: parseSkills(formData.get('required_skills')),
    preferred_skills: parseSkills(formData.get('preferred_skills')),
    responsibilities: String(formData.get('responsibilities') ?? '').trim() || null,
    description: String(formData.get('description') ?? '').trim() || null,
    positions_count: Number(formData.get('positions_count') ?? 1) || 1,
    application_deadline: String(formData.get('application_deadline') ?? '').trim() || null,
  };
}

export async function createJob(_prevState: JobFormState, formData: FormData): Promise<JobFormState> {
  const user = await requireRole('admin', 'hr_manager', 'recruiter');
  const payload = jobPayloadFromForm(formData);

  if (!payload.title) {
    return { error: 'Job title is required.' };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from('jobs')
    .insert({ ...payload, created_by: user.id, status: 'draft' as JobStatus })
    .select('id')
    .single();

  if (error) return { error: error.message };

  revalidatePath('/jobs');
  redirect(`/jobs/${data.id}`);
}

export async function updateJob(jobId: string, _prevState: JobFormState, formData: FormData): Promise<JobFormState> {
  await requireRole('admin', 'hr_manager', 'recruiter');
  const payload = jobPayloadFromForm(formData);

  if (!payload.title) {
    return { error: 'Job title is required.' };
  }

  const supabase = await createClient();
  const { error } = await supabase.from('jobs').update(payload).eq('id', jobId);
  if (error) return { error: error.message };

  revalidatePath('/jobs');
  revalidatePath(`/jobs/${jobId}`);
  redirect(`/jobs/${jobId}`);
}

export async function setJobStatus(jobId: string, status: JobStatus) {
  await requireRole('admin', 'hr_manager', 'recruiter');
  const supabase = await createClient();
  const { error } = await supabase.from('jobs').update({ status }).eq('id', jobId);
  if (error) throw error;

  revalidatePath('/jobs');
  revalidatePath(`/jobs/${jobId}`);
}

export async function duplicateJob(jobId: string) {
  const user = await requireRole('admin', 'hr_manager', 'recruiter');
  const supabase = await createClient();

  const { data: original, error: fetchError } = await supabase.from('jobs').select('*').eq('id', jobId).single();
  if (fetchError || !original) throw fetchError ?? new Error('Job not found');

  const { id, created_at, updated_at, ...rest } = original;
  void id;
  void created_at;
  void updated_at;

  const { data, error } = await supabase
    .from('jobs')
    .insert({ ...rest, title: `${original.title} (Copy)`, status: 'draft', created_by: user.id })
    .select('id')
    .single();

  if (error) throw error;

  revalidatePath('/jobs');
  redirect(`/jobs/${data.id}`);
}
