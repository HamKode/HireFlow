import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/dal';
import { createServiceRoleClient } from '@/lib/supabase/server';
import { groqJSON } from '@/lib/ai/groq';
import { interviewEvaluationPrompt } from '@/lib/ai/prompts';
import { InterviewEvaluationSchema } from '@/lib/ai/schemas';
import type { Job, Candidate, InterviewFeedback } from '@/lib/supabase/types';

const AUTHORIZED_ROLES = ['admin', 'hr_manager', 'recruiter'];

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user || !AUTHORIZED_ROLES.includes(user.profile.role)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const interviewId = body?.interview_id;
  if (!interviewId) {
    return NextResponse.json({ error: 'interview_id is required' }, { status: 400 });
  }

  const supabase = createServiceRoleClient();
  const { data: interview, error } = await supabase
    .from('interviews')
    .select('id, application:applications(job:jobs(*), candidate:candidates(*)), interview_feedback(*)')
    .eq('id', interviewId)
    .single();

  if (error || !interview) {
    return NextResponse.json({ error: 'Interview not found.' }, { status: 404 });
  }

  const application = interview.application as unknown as { job: Job; candidate: Candidate };
  const feedbackRows = interview.interview_feedback as unknown as InterviewFeedback[];
  const feedback = Array.isArray(feedbackRows) ? feedbackRows[0] : feedbackRows;

  if (!feedback) {
    return NextResponse.json({ error: 'No feedback submitted for this interview yet.' }, { status: 400 });
  }

  const { system, user: userPrompt } = interviewEvaluationPrompt({
    job: { title: application.job.title, required_skills: application.job.required_skills },
    candidate: { full_name: application.candidate.full_name },
    feedback: {
      technical_knowledge: feedback.technical_knowledge,
      problem_solving: feedback.problem_solving,
      communication: feedback.communication,
      role_fit: feedback.role_fit,
      experience_rating: feedback.experience_rating,
      strengths: feedback.strengths,
      weaknesses: feedback.weaknesses,
      notes: feedback.notes,
      recommendation: feedback.recommendation,
    },
  });

  let evaluation;
  for (let attempt = 0; attempt < 2 && !evaluation; attempt++) {
    try {
      const raw = await groqJSON({ system, user: userPrompt });
      const parsed = InterviewEvaluationSchema.safeParse(raw);
      if (parsed.success) evaluation = parsed.data;
    } catch {
      // retry
    }
  }

  if (!evaluation) {
    return NextResponse.json({ error: 'Evaluation generation failed.' }, { status: 502 });
  }

  await supabase
    .from('interview_feedback')
    .update({
      ai_evaluation_summary: evaluation.summary,
      ai_next_action: evaluation.suggested_next_action,
    })
    .eq('interview_id', interviewId);

  await supabase.from('automation_logs').insert({
    application_id: null,
    action: 'AI_INTERVIEW_EVALUATION_COMPLETED',
    status: 'success',
    source: 'ai-service',
    payload: { interview_id: interviewId },
  });

  return NextResponse.json({ evaluation });
}
