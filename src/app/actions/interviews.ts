'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { requireRole, requireUser } from '@/lib/auth/dal';
import { notifyApplicationEvent } from '@/lib/integrations/make';
import type { Application, InterviewStatus, InterviewType, InterviewRecommendation } from '@/lib/supabase/types';

export type InterviewFormState = { error?: string } | undefined;

export async function scheduleInterview(
  applicationId: string,
  _prevState: InterviewFormState,
  formData: FormData
): Promise<InterviewFormState> {
  await requireRole('admin', 'hr_manager', 'recruiter');

  const scheduledAt = String(formData.get('scheduled_at') ?? '');
  if (!scheduledAt) {
    return { error: 'Date and time are required.' };
  }

  const supabase = await createClient();

  const { data: interview, error } = await supabase
    .from('interviews')
    .insert({
      application_id: applicationId,
      interviewer_id: String(formData.get('interviewer_id') ?? '') || null,
      interview_type: String(formData.get('interview_type') ?? 'technical') as InterviewType,
      scheduled_at: new Date(scheduledAt).toISOString(),
      duration_minutes: Number(formData.get('duration_minutes') ?? 45) || 45,
      meeting_link: String(formData.get('meeting_link') ?? '').trim() || null,
      status: 'scheduled' as InterviewStatus,
    })
    .select('id')
    .single();

  if (error || !interview) return { error: error?.message ?? 'Failed to schedule interview.' };

  const { data: previous } = await supabase.from('applications').select('status').eq('id', applicationId).single();
  const { data: application } = await supabase
    .from('applications')
    .update({ status: 'interview_scheduled' })
    .eq('id', applicationId)
    .select('*')
    .single();

  await supabase.from('automation_logs').insert({
    application_id: applicationId,
    action: 'INTERVIEW_SCHEDULED',
    status: 'success',
    source: 'dashboard',
    payload: { interview_id: interview.id },
  });

  if (application) {
    await notifyApplicationEvent(supabase, {
      type: 'UPDATE',
      record: application as Application,
      oldRecord: previous ? { status: previous.status } : null,
    });
  }

  revalidatePath('/interviews');
  revalidatePath('/applications');
  redirect(`/interviews/${interview.id}`);
}

export async function updateInterviewStatus(interviewId: string, status: InterviewStatus) {
  await requireUser();

  const supabase = await createClient();
  const { error } = await supabase.from('interviews').update({ status }).eq('id', interviewId);
  if (error) throw error;

  revalidatePath('/interviews');
  revalidatePath(`/interviews/${interviewId}`);
}

export async function saveGeneratedQuestions(interviewId: string, questions: unknown) {
  await requireUser();
  const supabase = await createClient();
  const { error } = await supabase.from('interviews').update({ ai_generated_questions: questions }).eq('id', interviewId);
  if (error) throw error;
  revalidatePath(`/interviews/${interviewId}`);
}

export type FeedbackFormState = { error?: string } | undefined;

export async function submitFeedback(
  interviewId: string,
  applicationId: string,
  _prevState: FeedbackFormState,
  formData: FormData
): Promise<FeedbackFormState> {
  const user = await requireUser();
  if (!['admin', 'hr_manager', 'recruiter', 'interviewer'].includes(user.profile.role)) {
    return { error: 'Not authorized to submit feedback.' };
  }

  const num = (key: string) => {
    const v = formData.get(key);
    return v ? Number(v) : null;
  };

  const supabase = await createClient();
  const { error } = await supabase.from('interview_feedback').upsert(
    {
      interview_id: interviewId,
      interviewer_id: user.id,
      technical_knowledge: num('technical_knowledge'),
      problem_solving: num('problem_solving'),
      communication: num('communication'),
      role_fit: num('role_fit'),
      experience_rating: num('experience_rating'),
      strengths: String(formData.get('strengths') ?? '').trim() || null,
      weaknesses: String(formData.get('weaknesses') ?? '').trim() || null,
      notes: String(formData.get('notes') ?? '').trim() || null,
      recommendation: (String(formData.get('recommendation') ?? '').trim() || null) as InterviewRecommendation | null,
    },
    { onConflict: 'interview_id' }
  );

  if (error) return { error: error.message };

  await supabase.from('interviews').update({ status: 'completed' }).eq('id', interviewId);

  const { data: previous } = await supabase.from('applications').select('status').eq('id', applicationId).single();
  const { data: application } = await supabase
    .from('applications')
    .update({ status: 'interviewed' })
    .eq('id', applicationId)
    .select('*')
    .single();

  await supabase.from('automation_logs').insert({
    application_id: applicationId,
    action: 'INTERVIEW_FEEDBACK_SUBMITTED',
    status: 'success',
    source: 'dashboard',
    payload: { interview_id: interviewId },
  });

  if (application) {
    await notifyApplicationEvent(supabase, {
      type: 'UPDATE',
      record: application as Application,
      oldRecord: previous ? { status: previous.status } : null,
    });
  }

  revalidatePath(`/interviews/${interviewId}`);
  revalidatePath('/applications');
}
