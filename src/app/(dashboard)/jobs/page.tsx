import Link from 'next/link';
import { Plus } from 'lucide-react';
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
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-ink-900 dark:text-white">Jobs</h1>
          <p className="mt-1 text-sm text-ink-500">Create, publish, and track every open position.</p>
        </div>
        <Link href="/jobs/new" className="btn-primary">
          <Plus className="h-4 w-4" />
          New job
        </Link>
      </div>

      <form className="flex flex-col gap-3 sm:flex-row">
        <input name="q" defaultValue={params.q} placeholder="Search by title…" className="input sm:w-64" />
        <select name="status" defaultValue={params.status ?? ''} className="input sm:w-48">
          <option value="">All statuses</option>
          <option value="draft">Draft</option>
          <option value="published">Published</option>
          <option value="paused">Paused</option>
          <option value="closed">Closed</option>
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
                <th className="px-4 py-3">Title</th>
                <th className="px-4 py-3">Department</th>
                <th className="px-4 py-3">Location</th>
                <th className="px-4 py-3">Positions</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {jobs.map((job) => (
                <tr
                  key={job.id}
                  className="border-t border-ink-100 transition-colors hover:bg-ink-50/70 dark:border-white/10 dark:hover:bg-white/5"
                >
                  <td className="px-4 py-3">
                    <Link href={`/jobs/${job.id}`} className="font-medium text-ink-900 hover:text-brand-600 dark:text-white">
                      {job.title}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-ink-500">{job.department ?? '—'}</td>
                  <td className="px-4 py-3 text-ink-500">{job.location ?? '—'}</td>
                  <td className="px-4 py-3 text-ink-700 dark:text-ink-300">{job.positions_count}</td>
                  <td className="px-4 py-3">
                    <StatusBadge status={job.status} />
                  </td>
                </tr>
              ))}
              {jobs.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-10 text-center text-sm text-ink-400">
                    No jobs yet. Create your first one.
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
