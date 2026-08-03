import Link from 'next/link';
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
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold tracking-tight">Applications</h1>
        <Link
          href="/applications/new"
          className="rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-neutral-700 dark:bg-white dark:text-neutral-900"
        >
          Link candidate to job
        </Link>
      </div>

      <form className="flex gap-3">
        <select
          name="job"
          defaultValue={params.job ?? ''}
          className="rounded-md border border-neutral-300 px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-900"
        >
          <option value="">All jobs</option>
          {jobs.map((job) => (
            <option key={job.id} value={job.id}>
              {job.title}
            </option>
          ))}
        </select>
        <button
          type="submit"
          className="rounded-md border border-neutral-300 px-4 py-2 text-sm font-medium dark:border-neutral-700"
        >
          Filter
        </button>
      </form>

      <div className="overflow-hidden rounded-lg border border-neutral-200 dark:border-neutral-800">
        <table className="w-full text-sm">
          <thead className="bg-neutral-50 text-left text-xs uppercase text-neutral-500 dark:bg-neutral-900 dark:text-neutral-400">
            <tr>
              <th className="px-4 py-3 font-medium">Candidate</th>
              <th className="px-4 py-3 font-medium">Job</th>
              <th className="px-4 py-3 font-medium">Source</th>
              <th className="px-4 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {applications.map((app) => (
              <tr
                key={app.id}
                className="border-t border-neutral-100 hover:bg-neutral-50 dark:border-neutral-800 dark:hover:bg-neutral-900"
              >
                <td className="px-4 py-3">
                  <Link href={`/candidates/${app.candidate.id}`} className="font-medium hover:underline">
                    {app.candidate.full_name}
                  </Link>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400">{app.candidate.email}</p>
                </td>
                <td className="px-4 py-3">
                  <Link href={`/jobs/${app.job.id}`} className="hover:underline">
                    {app.job.title}
                  </Link>
                </td>
                <td className="px-4 py-3 text-neutral-500 dark:text-neutral-400">{app.source.replace(/_/g, ' ')}</td>
                <td className="px-4 py-3">
                  <StatusSelect applicationId={app.id} status={app.status} />
                </td>
              </tr>
            ))}
            {applications.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-neutral-500 dark:text-neutral-400">
                  No applications yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
