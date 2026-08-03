'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { requireRole } from '@/lib/auth/dal';
import { notifyApplicationEvent } from '@/lib/integrations/make';
import type { Application, ApplicationStatus, CandidateSource } from '@/lib/supabase/types';

export type ApplicationFormState = { error?: string } | undefined;

export async function createApplication(
  _prevState: ApplicationFormState,
  formData: FormData
): Promise<ApplicationFormState> {
  await requireRole('admin', 'hr_manager', 'recruiter');

  const job_id = String(formData.get('job_id') ?? '');
  const candidate_id = String(formData.get('candidate_id') ?? '');
  const source = String(formData.get('source') ?? 'other') as CandidateSource;

  if (!job_id || !candidate_id) {
    return { error: 'Select both a job and a candidate.' };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from('applications')
    .insert({ job_id, candidate_id, source })
    .select('*')
    .single();

  if (error) {
    if (error.code === '23505') {
      return { error: 'This candidate has already applied to this job.' };
    }
    return { error: error.message };
  }

  await supabase.from('automation_logs').insert({
    application_id: data.id,
    candidate_id,
    action: 'APPLICATION_CREATED',
    status: 'success',
    source: 'dashboard',
  });

  await notifyApplicationEvent(supabase, { type: 'INSERT', record: data as Application, oldRecord: null });

  revalidatePath('/applications');
  redirect('/applications');
}

export async function updateApplicationStatus(applicationId: string, status: ApplicationStatus) {
  await requireRole('admin', 'hr_manager', 'recruiter');

  const supabase = await createClient();
  const { data: previous } = await supabase.from('applications').select('status').eq('id', applicationId).single();

  const { data: application, error } = await supabase
    .from('applications')
    .update({ status })
    .eq('id', applicationId)
    .select('*')
    .single();

  if (error) throw error;

  await supabase.from('automation_logs').insert({
    application_id: applicationId,
    candidate_id: application.candidate_id,
    action: 'STATUS_CHANGED',
    status: 'success',
    source: 'dashboard',
    payload: { new_status: status },
  });

  await notifyApplicationEvent(supabase, {
    type: 'UPDATE',
    record: application as Application,
    oldRecord: previous ? { status: previous.status } : null,
  });

  revalidatePath('/applications');
}
