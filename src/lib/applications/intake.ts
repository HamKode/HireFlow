import 'server-only';
import type { SupabaseClient } from '@supabase/supabase-js';
import { extractResumeText } from '@/lib/resume/extract-text';
import { extractResumeProfile } from '@/lib/ai/extraction';
import { runResumeScreening, ScreeningError } from '@/lib/ai/screening';
import { notifyApplicationEvent } from '@/lib/integrations/make';
import { notifyRecruitingTeam } from '@/lib/notifications/notify';
import type { CandidateSource, Application } from '@/lib/supabase/types';

export class IntakeError extends Error {}

export type ApplicationIntakeInput = {
  jobId: string;
  fullName: string;
  email: string;
  phone?: string;
  location?: string;
  linkedinUrl?: string;
  githubUrl?: string;
  portfolioUrl?: string;
  yearsExperience?: number;
  expectedSalary?: number;
  noticePeriod?: string;
  coverLetter?: string;
  source: CandidateSource;
  resumeFile?: File | null;
};

// The single place the full candidate-application pipeline runs: dedupe ->
// create candidate/application -> upload + extract resume -> AI profile
// extraction -> AI screening -> deterministic scoring -> routing. Mirrors
// what a Make.com "Candidate Application Intake" scenario would orchestrate
// (see docs/make-scenarios/) but runs natively so the demo works without
// requiring a Make.com account to be configured.
//
// Runs on the service-role client (candidates aren't authenticated users),
// which bypasses RLS entirely - every insert below explicitly sets
// organization_id (taken from the job being applied to) since there's no
// RLS safety net enforcing tenant isolation here.
export async function processApplicationIntake(supabase: SupabaseClient, input: ApplicationIntakeInput) {
  const email = input.email.trim().toLowerCase();

  const { data: job, error: jobError } = await supabase
    .from('jobs')
    .select('id, status, organization_id')
    .eq('id', input.jobId)
    .single();
  if (jobError || !job) {
    throw new IntakeError('Job not found.');
  }
  const organizationId = job.organization_id as string;

  // Duplicate candidate detection (by email, within this organization only —
  // the same person can be a candidate at multiple companies independently)
  // per project policy — reuse the existing candidate record instead of
  // creating a new one.
  const { data: existingCandidate } = await supabase
    .from('candidates')
    .select('id')
    .eq('email', email)
    .eq('organization_id', organizationId)
    .maybeSingle();

  let candidateId: string;
  let isDuplicateCandidate = false;

  if (existingCandidate) {
    candidateId = existingCandidate.id;
    isDuplicateCandidate = true;
    await supabase
      .from('candidates')
      .update({
        full_name: input.fullName,
        phone: input.phone || null,
        location: input.location || null,
        linkedin_url: input.linkedinUrl || null,
        github_url: input.githubUrl || null,
        portfolio_url: input.portfolioUrl || null,
        years_experience: input.yearsExperience ?? null,
      })
      .eq('id', candidateId);
  } else {
    const { data: created, error: createError } = await supabase
      .from('candidates')
      .insert({
        organization_id: organizationId,
        full_name: input.fullName,
        email,
        phone: input.phone || null,
        location: input.location || null,
        linkedin_url: input.linkedinUrl || null,
        github_url: input.githubUrl || null,
        portfolio_url: input.portfolioUrl || null,
        years_experience: input.yearsExperience ?? null,
      })
      .select('id')
      .single();
    if (createError || !created) throw new IntakeError(createError?.message ?? 'Failed to create candidate.');
    candidateId = created.id;
  }

  // One application per (job, candidate) — the DB has a unique constraint too.
  const { data: existingApplication } = await supabase
    .from('applications')
    .select('id')
    .eq('job_id', input.jobId)
    .eq('candidate_id', candidateId)
    .maybeSingle();

  if (existingApplication) {
    await supabase.from('automation_logs').insert({
      organization_id: organizationId,
      application_id: existingApplication.id,
      candidate_id: candidateId,
      action: 'DUPLICATE_APPLICATION',
      status: 'success',
      source: 'apply-form',
    });
    return { applicationId: existingApplication.id, candidateId, alreadyApplied: true, isDuplicateCandidate };
  }

  const { data: application, error: appError } = await supabase
    .from('applications')
    .insert({
      organization_id: organizationId,
      job_id: input.jobId,
      candidate_id: candidateId,
      status: 'applied',
      source: input.source,
      expected_salary: input.expectedSalary ?? null,
      notice_period: input.noticePeriod || null,
      cover_letter: input.coverLetter || null,
    })
    .select('*')
    .single();
  if (appError || !application) throw new IntakeError(appError?.message ?? 'Failed to create application.');

  const applicationId = (application as Application).id;

  await supabase.from('automation_logs').insert({
    organization_id: organizationId,
    application_id: applicationId,
    candidate_id: candidateId,
    action: 'APPLICATION_RECEIVED',
    status: 'success',
    source: 'apply-form',
    payload: { is_duplicate_candidate: isDuplicateCandidate },
  });

  await notifyApplicationEvent(supabase, { type: 'INSERT', record: application as Application, oldRecord: null });

  // Resume upload + deterministic text extraction (no AI involved in getting
  // raw text out of the file itself).
  if (input.resumeFile) {
    try {
      const bytes = new Uint8Array(await input.resumeFile.arrayBuffer());
      const path = `${candidateId}/${Date.now()}-${input.resumeFile.name}`;
      const { error: uploadError } = await supabase.storage
        .from('resumes')
        .upload(path, bytes, { contentType: input.resumeFile.type, upsert: false });

      if (uploadError) throw uploadError;

      const resumeText = await extractResumeText(input.resumeFile);

      await supabase.from('candidates').update({ resume_url: path, resume_raw_text: resumeText }).eq('id', candidateId);
      await supabase.from('automation_logs').insert({
        organization_id: organizationId,
        application_id: applicationId,
        candidate_id: candidateId,
        action: 'RESUME_UPLOADED',
        status: 'success',
        source: 'apply-form',
      });

      const profile = await extractResumeProfile(resumeText);
      if (profile) {
        await supabase
          .from('candidates')
          .update({
            education: profile.education,
            years_experience: profile.years_experience ?? input.yearsExperience ?? null,
            previous_companies: profile.previous_companies,
            previous_roles: profile.previous_roles,
            technical_skills: profile.technical_skills,
            soft_skills: profile.soft_skills,
            certifications: profile.certifications,
            projects: profile.projects,
          })
          .eq('id', candidateId);
        await supabase.from('automation_logs').insert({
          organization_id: organizationId,
          application_id: applicationId,
          candidate_id: candidateId,
          action: 'RESUME_PARSED',
          status: 'success',
          source: 'ai-service',
        });
      } else {
        await supabase.from('automation_logs').insert({
          organization_id: organizationId,
          application_id: applicationId,
          candidate_id: candidateId,
          action: 'RESUME_PARSE_FAILED',
          status: 'failure',
          source: 'ai-service',
          error_message: 'AI profile extraction returned no result; kept form-submitted fields.',
        });
      }
    } catch (err) {
      await supabase.from('automation_logs').insert({
        organization_id: organizationId,
        application_id: applicationId,
        candidate_id: candidateId,
        action: 'RESUME_UPLOAD_FAILED',
        status: 'failure',
        source: 'apply-form',
        error_message: err instanceof Error ? err.message : 'Resume upload/extraction failed.',
      });
    }
  }

  // AI screening + deterministic scoring, then move to hr_review so a human
  // makes the shortlist/hold/reject call — the AI's suggestion is stored on
  // candidate_scores.routing_decision, it never sets the final status itself.
  await supabase.from('applications').update({ status: 'screening' }).eq('id', applicationId);
  try {
    const result = await runResumeScreening(supabase, applicationId);
    await supabase.from('applications').update({ status: 'hr_review' }).eq('id', applicationId);
    await supabase.from('automation_logs').insert({
      organization_id: organizationId,
      application_id: applicationId,
      candidate_id: candidateId,
      action: 'CANDIDATE_ROUTED',
      status: 'success',
      source: 'ai-service',
      payload: { routing_decision: result.routingDecision, weighted_final_score: result.weightedScore },
    });
    await notifyRecruitingTeam(supabase, {
      organizationId,
      title: 'Candidate needs HR review',
      message: `${input.fullName} scored ${result.weightedScore} (${result.routingDecision.replace('_', ' ')} suggested).`,
      relatedApplicationId: applicationId,
    });
  } catch (err) {
    // Screening logs its own failure; application stays at "screening" so
    // it's visibly stuck for HR / retry rather than silently lost.
    if (!(err instanceof ScreeningError)) throw err;
  }

  return { applicationId, candidateId, alreadyApplied: false, isDuplicateCandidate };
}
