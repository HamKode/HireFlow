import 'server-only';
import type { SupabaseClient } from '@supabase/supabase-js';
import { groqJSON, AI_CONFIG } from '@/lib/ai/groq';
import { resumeAnalysisPrompt } from '@/lib/ai/prompts';
import { ResumeAnalysisSchema } from '@/lib/ai/schemas';
import { calculateWeightedScore, suggestRoutingDecision } from '@/lib/scoring/weighted-score';
import type { Job, Candidate } from '@/lib/supabase/types';

export class ScreeningError extends Error {}

// Shared by POST /api/ai/resume-screening (dashboard + Make.com webhook callers)
// and the public application intake pipeline, so both paths do the exact same
// AI call + deterministic scoring + persistence + audit logging.
export async function runResumeScreening(supabase: SupabaseClient, applicationId: string) {
  const { data: application, error: appError } = await supabase
    .from('applications')
    .select('id, candidate_id, job_id, job:jobs(*), candidate:candidates(*)')
    .eq('id', applicationId)
    .single();

  if (appError || !application) {
    throw new ScreeningError('Application not found.');
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
    throw new ScreeningError('AI screening failed.');
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
    throw new ScreeningError(upsertError.message);
  }

  await supabase.from('automation_logs').insert({
    application_id: applicationId,
    candidate_id: application.candidate_id,
    action: 'AI_SCREENING_COMPLETED',
    status: 'success',
    source: 'ai-service',
    payload: { weighted_final_score: weightedScore, routing_decision: routingDecision },
  });

  return { weightedScore, routingDecision, analysis };
}
