import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/dal';
import { createServiceRoleClient } from '@/lib/supabase/server';
import { groqJSON } from '@/lib/ai/groq';
import { interviewQuestionsPrompt } from '@/lib/ai/prompts';
import { InterviewQuestionsSchema } from '@/lib/ai/schemas';
import type { Job, Candidate } from '@/lib/supabase/types';

const AUTHORIZED_ROLES = ['admin', 'hr_manager', 'recruiter', 'interviewer', 'hiring_manager'];

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
    .select('id, organization_id, application:applications(job:jobs(*), candidate:candidates(*))')
    .eq('id', interviewId)
    .single();

  if (error || !interview) {
    return NextResponse.json({ error: 'Interview not found.' }, { status: 404 });
  }
  // Service role bypasses RLS entirely, so this route must verify tenant
  // ownership itself — otherwise any signed-in user could pass another
  // organization's interview_id and get AI processing run against it.
  if (interview.organization_id !== user.profile.organization_id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  const application = interview.application as unknown as { job: Job; candidate: Candidate };
  const job = application.job;
  const candidate = application.candidate;

  const { system, user: userPrompt } = interviewQuestionsPrompt({
    job: { title: job.title, description: job.description, required_skills: job.required_skills },
    candidate: {
      full_name: candidate.full_name,
      years_experience: candidate.years_experience,
      previous_roles: candidate.previous_roles,
      technical_skills: candidate.technical_skills,
      projects: candidate.projects as { name: string; description: string }[],
      resume_raw_text: candidate.resume_raw_text,
    },
  });

  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const raw = await groqJSON({ system, user: userPrompt });
      const parsed = InterviewQuestionsSchema.safeParse(raw);
      if (parsed.success) {
        return NextResponse.json({ result: parsed.data });
      }
    } catch {
      // retry
    }
  }

  return NextResponse.json({ error: 'Question generation failed.' }, { status: 502 });
}
