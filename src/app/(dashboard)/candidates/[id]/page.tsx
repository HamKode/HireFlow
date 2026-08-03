import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Link2, Code2, Globe } from 'lucide-react';
import { getCandidate, getCandidateApplications } from '@/lib/data/candidates';
import { updateResumeText } from '@/app/actions/candidates';
import { StatusBadge } from '@/components/ui/status-badge';
import { ScreeningPanel } from '@/components/candidates/screening-panel';
import { ResumeLink } from '@/components/candidates/resume-link';
import { FinalReviewActions } from '@/components/applications/final-review-actions';
import { DeleteCandidateButton } from '@/components/candidates/delete-candidate-button';
import type { CandidateScore } from '@/lib/supabase/types';

const FINAL_REVIEW_STATUSES = ['interviewed', 'final_review'];
const OFFER_STAGE_STATUSES = ['offer_pending', 'offer_sent', 'offer_accepted', 'hired', 'onboarding'];

export default async function CandidateDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const candidate = await getCandidate(id).catch(() => null);
  if (!candidate) notFound();

  const applications = await getCandidateApplications(id);

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-ink-900 dark:text-white">
            {candidate.full_name}
          </h1>
          <p className="mt-1 text-sm text-ink-500">
            {[candidate.email, candidate.phone, candidate.location].filter(Boolean).join(' · ')}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href={`/applications/new?candidate=${candidate.id}`} className="btn-secondary">
            Link to job
          </Link>
          <DeleteCandidateButton candidateId={candidate.id} candidateName={candidate.full_name} />
        </div>
      </div>

      {(candidate.linkedin_url || candidate.github_url || candidate.portfolio_url) && (
        <div className="flex flex-wrap gap-4 text-sm">
          {candidate.linkedin_url && (
            <a
              href={candidate.linkedin_url}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 font-medium text-brand-600 hover:text-brand-700"
            >
              <Link2 className="h-3.5 w-3.5" /> LinkedIn
            </a>
          )}
          {candidate.github_url && (
            <a
              href={candidate.github_url}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 font-medium text-brand-600 hover:text-brand-700"
            >
              <Code2 className="h-3.5 w-3.5" /> GitHub
            </a>
          )}
          {candidate.portfolio_url && (
            <a
              href={candidate.portfolio_url}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 font-medium text-brand-600 hover:text-brand-700"
            >
              <Globe className="h-3.5 w-3.5" /> Portfolio
            </a>
          )}
        </div>
      )}

      <div className="card grid grid-cols-1 gap-4 p-5 text-sm sm:grid-cols-2">
        <Info label="Years of experience" value={candidate.years_experience ? `${candidate.years_experience}` : null} />
        <Info label="Education" value={candidate.education} />
      </div>

      {candidate.technical_skills.length > 0 && (
        <section>
          <h2 className="mb-1.5 text-sm font-semibold text-ink-900 dark:text-white">Technical skills</h2>
          <div className="flex flex-wrap gap-1.5">
            {candidate.technical_skills.map((skill) => (
              <span
                key={skill}
                className="rounded-full bg-ink-100 px-2.5 py-1 text-xs font-medium text-ink-700 dark:bg-white/5 dark:text-ink-300"
              >
                {skill}
              </span>
            ))}
          </div>
        </section>
      )}

      <section className="card p-5">
        <h2 className="mb-1.5 text-sm font-semibold text-ink-900 dark:text-white">Resume text</h2>
        <p className="mb-3 text-xs text-ink-500">
          Populated automatically when a candidate applies with a resume file, or paste text manually below.
        </p>
        {candidate.resume_url && (
          <div className="mb-3">
            <ResumeLink path={candidate.resume_url} />
          </div>
        )}
        <form action={updateResumeText.bind(null, candidate.id)} className="space-y-2">
          <textarea name="resume_raw_text" rows={6} defaultValue={candidate.resume_raw_text ?? ''} className="input" />
          <button type="submit" className="btn-secondary">
            Save resume text
          </button>
        </form>
      </section>

      <section>
        <h2 className="mb-2 text-sm font-semibold text-ink-900 dark:text-white">Applications</h2>
        {applications.length === 0 ? (
          <p className="text-sm text-ink-500">Not linked to any job yet.</p>
        ) : (
          <div className="space-y-3">
            {applications.map((app) => {
              const score = (Array.isArray(app.candidate_scores) ? app.candidate_scores[0] : app.candidate_scores) as
                | CandidateScore
                | null;
              return (
                <div key={app.id} className="card space-y-3 p-4 sm:p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <Link href={`/jobs/${app.job.id}`} className="font-medium text-ink-900 hover:text-brand-600 dark:text-white">
                        {app.job.title}
                      </Link>
                      <p className="text-xs text-ink-500">{app.job.department}</p>
                    </div>
                    <StatusBadge status={app.status} />
                  </div>
                  <ScreeningPanel applicationId={app.id} score={score} />

                  <div className="flex flex-col gap-3 rounded-xl border border-ink-200/70 p-3 sm:flex-row sm:items-center sm:justify-between dark:border-white/10">
                    <div>
                      <p className="text-xs font-medium text-ink-500">Interviews</p>
                      {app.interviews.length === 0 ? (
                        <p className="text-sm text-ink-500">None scheduled</p>
                      ) : (
                        <ul className="mt-1 space-y-1 text-sm">
                          {app.interviews.map((iv: { id: string; status: string; scheduled_at: string; interview_type: string }) => (
                            <li key={iv.id}>
                              <Link href={`/interviews/${iv.id}`} className="text-ink-700 hover:text-brand-600 dark:text-ink-300">
                                {new Date(iv.scheduled_at).toLocaleString()} — {iv.interview_type.replace('_', ' ')} (
                                {iv.status})
                              </Link>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                    <Link href={`/interviews/new?application=${app.id}`} className="btn-secondary text-xs">
                      Schedule interview
                    </Link>
                  </div>

                  {FINAL_REVIEW_STATUSES.includes(app.status) && <FinalReviewActions applicationId={app.id} />}

                  {OFFER_STAGE_STATUSES.includes(app.status) && (
                    <div className="rounded-xl border border-ink-200/70 p-3 dark:border-white/10">
                      <p className="mb-1.5 text-xs font-medium text-ink-500">Offer</p>
                      {app.offers.length === 0 ? (
                        <Link href={`/offers/new?application=${app.id}`} className="btn-secondary text-xs">
                          Generate offer letter
                        </Link>
                      ) : (
                        <Link href={`/offers/${app.offers[0].id}`} className="text-sm font-medium text-brand-600 hover:text-brand-700">
                          View offer ({app.offers[0].status})
                        </Link>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string | null }) {
  if (!value) return null;
  return (
    <div>
      <p className="text-xs font-medium text-ink-500">{label}</p>
      <p className="text-ink-900 dark:text-white">{value}</p>
    </div>
  );
}
