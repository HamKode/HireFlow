import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getCandidate, getCandidateApplications } from '@/lib/data/candidates';
import { updateResumeText } from '@/app/actions/candidates';
import { StatusBadge } from '@/components/ui/status-badge';
import { ScreeningPanel } from '@/components/candidates/screening-panel';
import { ResumeLink } from '@/components/candidates/resume-link';
import type { CandidateScore } from '@/lib/supabase/types';

export default async function CandidateDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const candidate = await getCandidate(id).catch(() => null);
  if (!candidate) notFound();

  const applications = await getCandidateApplications(id);

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">{candidate.full_name}</h1>
          <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
            {[candidate.email, candidate.phone, candidate.location].filter(Boolean).join(' · ')}
          </p>
        </div>
        <Link
          href={`/applications/new?candidate=${candidate.id}`}
          className="rounded-md border border-neutral-300 px-3 py-1.5 text-sm font-medium hover:bg-neutral-50 dark:border-neutral-700 dark:hover:bg-neutral-900"
        >
          Link to job
        </Link>
      </div>

      <div className="flex gap-4 text-sm">
        {candidate.linkedin_url && (
          <a href={candidate.linkedin_url} target="_blank" className="text-blue-600 hover:underline">
            LinkedIn
          </a>
        )}
        {candidate.github_url && (
          <a href={candidate.github_url} target="_blank" className="text-blue-600 hover:underline">
            GitHub
          </a>
        )}
        {candidate.portfolio_url && (
          <a href={candidate.portfolio_url} target="_blank" className="text-blue-600 hover:underline">
            Portfolio
          </a>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4 text-sm">
        <Info label="Years of experience" value={candidate.years_experience ? `${candidate.years_experience}` : null} />
        <Info label="Education" value={candidate.education} />
      </div>

      {candidate.technical_skills.length > 0 && (
        <section>
          <h2 className="mb-1.5 text-sm font-semibold">Technical skills</h2>
          <div className="flex flex-wrap gap-1.5">
            {candidate.technical_skills.map((skill) => (
              <span
                key={skill}
                className="rounded-full bg-neutral-100 px-2.5 py-0.5 text-xs text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300"
              >
                {skill}
              </span>
            ))}
          </div>
        </section>
      )}

      <section>
        <h2 className="mb-1.5 text-sm font-semibold">Resume text</h2>
        <p className="mb-2 text-xs text-neutral-500 dark:text-neutral-400">
          Populated automatically when a candidate applies with a resume file, or paste text manually below.
        </p>
        {candidate.resume_url && (
          <div className="mb-3">
            <ResumeLink path={candidate.resume_url} />
          </div>
        )}
        <form action={updateResumeText.bind(null, candidate.id)} className="space-y-2">
          <textarea
            name="resume_raw_text"
            rows={6}
            defaultValue={candidate.resume_raw_text ?? ''}
            className="w-full rounded-md border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-neutral-900 dark:border-neutral-700 dark:bg-neutral-900 dark:focus:border-white"
          />
          <button
            type="submit"
            className="rounded-md border border-neutral-300 px-3 py-1.5 text-sm font-medium hover:bg-neutral-50 dark:border-neutral-700 dark:hover:bg-neutral-900"
          >
            Save resume text
          </button>
        </form>
      </section>

      <section>
        <h2 className="mb-2 text-sm font-semibold">Applications</h2>
        {applications.length === 0 ? (
          <p className="text-sm text-neutral-500 dark:text-neutral-400">Not linked to any job yet.</p>
        ) : (
          <div className="space-y-3">
            {applications.map((app) => {
              const score = (Array.isArray(app.candidate_scores) ? app.candidate_scores[0] : app.candidate_scores) as
                | CandidateScore
                | null;
              return (
                <div key={app.id} className="space-y-3 rounded-lg border border-neutral-200 p-4 dark:border-neutral-800">
                  <div className="flex items-center justify-between">
                    <div>
                      <Link href={`/jobs/${app.job.id}`} className="font-medium hover:underline">
                        {app.job.title}
                      </Link>
                      <p className="text-xs text-neutral-500 dark:text-neutral-400">{app.job.department}</p>
                    </div>
                    <StatusBadge status={app.status} />
                  </div>
                  <ScreeningPanel applicationId={app.id} score={score} />
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
      <p className="text-xs font-medium text-neutral-500 dark:text-neutral-400">{label}</p>
      <p>{value}</p>
    </div>
  );
}
