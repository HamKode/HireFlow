import Link from 'next/link';
import { listJobs } from '@/lib/data/jobs';
import { StatusBadge } from '@/components/ui/status-badge';
import type { JobStatus } from '@/lib/supabase/types';

export default async function JobsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; q?: string }>;
}) {
  const params = await searchParams;
  const jobs = await listJobs({
    status: (params.status as JobStatus) || undefined,
    search: params.q,
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold tracking-tight">Jobs</h1>
        <Link
          href="/jobs/new"
          className="rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-neutral-700 dark:bg-white dark:text-neutral-900"
        >
          New job
        </Link>
      </div>

      <form className="flex gap-3">
        <input
          name="q"
          defaultValue={params.q}
          placeholder="Search by title…"
          className="w-64 rounded-md border border-neutral-300 px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-900"
        />
        <select
          name="status"
          defaultValue={params.status ?? ''}
          className="rounded-md border border-neutral-300 px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-900"
        >
          <option value="">All statuses</option>
          <option value="draft">Draft</option>
          <option value="published">Published</option>
          <option value="paused">Paused</option>
          <option value="closed">Closed</option>
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
              <th className="px-4 py-3 font-medium">Title</th>
              <th className="px-4 py-3 font-medium">Department</th>
              <th className="px-4 py-3 font-medium">Location</th>
              <th className="px-4 py-3 font-medium">Positions</th>
              <th className="px-4 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {jobs.map((job) => (
              <tr
                key={job.id}
                className="border-t border-neutral-100 hover:bg-neutral-50 dark:border-neutral-800 dark:hover:bg-neutral-900"
              >
                <td className="px-4 py-3">
                  <Link href={`/jobs/${job.id}`} className="font-medium hover:underline">
                    {job.title}
                  </Link>
                </td>
                <td className="px-4 py-3 text-neutral-500 dark:text-neutral-400">{job.department ?? '—'}</td>
                <td className="px-4 py-3 text-neutral-500 dark:text-neutral-400">{job.location ?? '—'}</td>
                <td className="px-4 py-3">{job.positions_count}</td>
                <td className="px-4 py-3">
                  <StatusBadge status={job.status} />
                </td>
              </tr>
            ))}
            {jobs.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-neutral-500 dark:text-neutral-400">
                  No jobs yet. Create your first one.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
