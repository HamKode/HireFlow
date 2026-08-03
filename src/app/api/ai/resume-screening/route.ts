import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/dal';
import { createServiceRoleClient } from '@/lib/supabase/server';
import { groqJSON, AI_CONFIG } from '@/lib/ai/groq';
import { resumeAnalysisPrompt } from '@/lib/ai/prompts';
import { ResumeAnalysisSchema } from '@/lib/ai/schemas';
import { calculateWeightedScore, suggestRoutingDecision } from '@/lib/scoring/weighted-score';
import type { Job, Candidate } from '@/lib/supabase/types';

const AUTHORIZED_ROLES = ['admin', 'hr_manager', 'recruiter'];

// Called two ways: (1) an HR user clicking "Run AI Screening" in the dashboard
// (session cookie), or (2) a Make.com scenario's HTTP module in Phase 4
// (X-Webhook-Secret header). Both paths use the service-role client because
// Make.com never carries a Supabase user session.
async function isAuthorized(request: Request): Promise<boolean> {
  const secret = request.headers.get('x-webhook-secret');
  if (secret && process.env.MAKE_WEBHOOK_SECRET && secret === process.env.MAKE_WEBHOOK_SECRET) {
    return true;
  }
  const user = await getCurrentUser();
  return !!user && AUTHORIZED_ROLES.includes(user.profile.role);
}

export async function POST(request: Request) {
  if (!(await isAuthorized(request))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const applicationId = body?.application_id;
  if (!applicationId) {
    return NextResponse.json({ error: 'application_id is required' }, { status: 400 });
  }

  const supabase = createServiceRoleClient();

  const { data: application, error: appError } = await supabase
    .from('applications')
    .select('id, candidate_id, job_id, job:jobs(*), candidate:candidates(*)')
    .eq('id', applicationId)
    .single();

  if (appError || !application) {
    return NextResponse.json({ error: 'Application not found.' }, { status: 404 });
  }

  const job = application.job as unknown as Job;
  const candidate = application.candidate as unknown as Candidate;

  const { system, user: userPrompt } = resumeAnalysisPrompt({
    job: {
      title: job.title,
      description: job.description,
      required_skills: job.required_skills,
      preferred_skills: job.preferred_skills,
      experience_required: job.experience_required,
      education: job.education,
    },
    candidate: {
      full_name: candidate.full_name,
      years_experience: candidate.years_experience,
      education: candidate.education,
      previous_companies: candidate.previous_companies,
      previous_roles: candidate.previous_roles,
      technical_skills: candidate.technical_skills,
      soft_skills: candidate.soft_skills,
      certifications: candidate.certifications,
      resume_raw_text: candidate.resume_raw_text,
    },
  });

  let analysis;
  let lastError: unknown;
  for (let attempt = 0; attempt < 2 && !analysis; attempt++) {
    try {
      const raw = await groqJSON({ system, user: userPrompt });
      const parsed = ResumeAnalysisSchema.safeParse(raw);
      if (parsed.success) {
        analysis = parsed.data;
      } else {
        lastError = parsed.error;
      }
    } catch (err) {
      lastError = err;
    }
  }

  if (!analysis) {
    await supabase.from('automation_logs').insert({
      application_id: applicationId,
      candidate_id: application.candidate_id,
      action: 'AI_SCREENING_FAILED',
      status: 'failure',
      source: 'ai-service',
      error_message: lastError instanceof Error ? lastError.message : 'AI response did not match expected schema.',
    });
    return NextResponse.json({ error: 'AI screening failed.' }, { status: 502 });
  }

  const weightedScore = calculateWeightedScore(
    {
      skills_score: analysis.skills_score,
      experience_score: analysis.experience_score,
      technical_score: analysis.technical_score,
      education_score: analysis.education_score,
      portfolio_score: analysis.portfolio_score,
    },
    job.scoring_weights
  );
  const routingDecision = suggestRoutingDecision(weightedScore);

  const { error: upsertError } = await supabase.from('candidate_scores').upsert(
    {
      application_id: applicationId,
      skills_score: analysis.skills_score,
      experience_score: analysis.experience_score,
      technical_score: analysis.technical_score,
      education_score: analysis.education_score,
      portfolio_score: analysis.portfolio_score,
      weighted_final_score: weightedScore,
      matched_skills: analysis.matched_skills,
      missing_skills: analysis.missing_skills,
      strengths: analysis.strengths,
      concerns: analysis.concerns,
      ai_summary: analysis.summary,
      ai_recommendation: analysis.recommendation,
      routing_decision: routingDecision,
      model_used: AI_CONFIG.model,
      raw_ai_response: analysis,
    },
    { onConflict: 'application_id' }
  );

  if (upsertError) {
    return NextResponse.json({ error: upsertError.message }, { status: 500 });
  }

  await supabase.from('automation_logs').insert({
    application_id: applicationId,
    candidate_id: application.candidate_id,
    action: 'AI_SCREENING_COMPLETED',
    status: 'success',
    source: 'ai-service',
    payload: { weighted_final_score: weightedScore, routing_decision: routingDecision },
  });

  return NextResponse.json({ weighted_final_score: weightedScore, routing_decision: routingDecision, analysis });
}
