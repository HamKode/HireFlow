import Link from 'next/link';
import { listInterviews } from '@/lib/data/interviews';
import { StatusBadge } from '@/components/ui/status-badge';

export default async function InterviewsPage() {
  const interviews = await listInterviews();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight text-ink-900 dark:text-white">Interviews</h1>
        <p className="mt-1 text-sm text-ink-500">Every scheduled conversation, across every job.</p>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-ink-50 text-left text-xs font-medium uppercase tracking-wide text-ink-500 dark:bg-white/5">
              <tr>
                <th className="px-4 py-3">Candidate</th>
                <th className="px-4 py-3">Job</th>
                <th className="px-4 py-3">When</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Interviewer</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {interviews.map((iv) => (
                <tr
                  key={iv.id}
                  className="border-t border-ink-100 transition-colors hover:bg-ink-50/70 dark:border-white/10 dark:hover:bg-white/5"
                >
                  <td className="px-4 py-3">
                    <Link href={`/interviews/${iv.id}`} className="font-medium text-ink-900 hover:text-brand-600 dark:text-white">
                      {iv.application.candidate.full_name}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-ink-500">{iv.application.job.title}</td>
                  <td className="px-4 py-3 text-ink-700 dark:text-ink-300">
                    {iv.scheduled_at ? new Date(iv.scheduled_at).toLocaleString() : '—'}
                  </td>
                  <td className="px-4 py-3 text-ink-500">{iv.interview_type.replace('_', ' ')}</td>
                  <td className="px-4 py-3 text-ink-500">{iv.interviewer?.full_name ?? 'Unassigned'}</td>
                  <td className="px-4 py-3">
                    <StatusBadge status={iv.status} />
                  </td>
                </tr>
              ))}
              {interviews.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-sm text-ink-400">
                    No interviews scheduled yet.
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
