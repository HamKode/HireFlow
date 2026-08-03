import Link from 'next/link';
import { Link2 } from 'lucide-react';
import { listApplications, listJobOptions } from '@/lib/data/applications';
import { StatusSelect } from '@/components/applications/status-select';
import type { ApplicationStatus } from '@/lib/supabase/types';

export default async function ApplicationsPage({
  searchParams,
}: {
  searchParams: Promise<{ job?: string; status?: string }>;
}) {
  const params = await searchParams;
  const [applications, jobs] = await Promise.all([
    listApplications({ jobId: params.job, status: params.status as ApplicationStatus }),
    listJobOptions(),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-ink-900 dark:text-white">
            Applications
          </h1>
          <p className="mt-1 text-sm text-ink-500">Every candidate&apos;s pipeline stage, at a glance.</p>
        </div>
        <Link href="/applications/new" className="btn-primary">
          <Link2 className="h-4 w-4" />
          Link candidate to job
        </Link>
      </div>

      <form className="flex flex-col gap-3 sm:flex-row">
        <select name="job" defaultValue={params.job ?? ''} className="input sm:w-64">
          <option value="">All jobs</option>
          {jobs.map((job) => (
            <option key={job.id} value={job.id}>
              {job.title}
            </option>
          ))}
        </select>
        <button type="submit" className="btn-secondary">
          Filter
        </button>
      </form>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-ink-50 text-left text-xs font-medium uppercase tracking-wide text-ink-500 dark:bg-white/5">
              <tr>
                <th className="px-4 py-3">Candidate</th>
                <th className="px-4 py-3">Job</th>
                <th className="px-4 py-3">Source</th>
                <th className="px-4 py-3">Score</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {applications.map((app) => {
                const score = Array.isArray(app.candidate_scores) ? app.candidate_scores[0] : app.candidate_scores;
                return (
                  <tr
                    key={app.id}
                    className="border-t border-ink-100 transition-colors hover:bg-ink-50/70 dark:border-white/10 dark:hover:bg-white/5"
                  >
                    <td className="px-4 py-3">
                      <Link href={`/candidates/${app.candidate.id}`} className="font-medium text-ink-900 hover:text-brand-600 dark:text-white">
                        {app.candidate.full_name}
                      </Link>
                      <p className="text-xs text-ink-500">{app.candidate.email}</p>
                    </td>
                    <td className="px-4 py-3">
                      <Link href={`/jobs/${app.job.id}`} className="text-ink-700 hover:text-brand-600 dark:text-ink-300">
                        {app.job.title}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-ink-500">{app.source.replace(/_/g, ' ')}</td>
                    <td className="px-4 py-3 font-semibold text-ink-900 dark:text-white">
                      {score?.weighted_final_score ?? '—'}
                    </td>
                    <td className="px-4 py-3">
                      <StatusSelect applicationId={app.id} status={app.status} />
                    </td>
                  </tr>
                );
              })}
              {applications.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-10 text-center text-sm text-ink-400">
                    No applications yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
