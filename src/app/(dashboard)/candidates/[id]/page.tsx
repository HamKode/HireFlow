import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getCandidate, getCandidateApplications } from '@/lib/data/candidates';
import { StatusBadge } from '@/components/ui/status-badge';

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
        <h2 className="mb-2 text-sm font-semibold">Applications</h2>
        {applications.length === 0 ? (
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            Not linked to any job yet.
          </p>
        ) : (
          <div className="overflow-hidden rounded-lg border border-neutral-200 dark:border-neutral-800">
            <table className="w-full text-sm">
              <tbody>
                {applications.map((app) => (
                  <tr
                    key={app.id}
                    className="border-t border-neutral-100 first:border-t-0 dark:border-neutral-800"
                  >
                    <td className="px-4 py-3">
                      <Link href={`/jobs/${app.job.id}`} className="font-medium hover:underline">
                        {app.job.title}
                      </Link>
                      <p className="text-xs text-neutral-500 dark:text-neutral-400">{app.job.department}</p>
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={app.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
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
