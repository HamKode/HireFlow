import Link from 'next/link';
import { listInterviews } from '@/lib/data/interviews';
import { StatusBadge } from '@/components/ui/status-badge';

export default async function InterviewsPage() {
  const interviews = await listInterviews();

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold tracking-tight">Interviews</h1>

      <div className="overflow-hidden rounded-lg border border-neutral-200 dark:border-neutral-800">
        <table className="w-full text-sm">
          <thead className="bg-neutral-50 text-left text-xs uppercase text-neutral-500 dark:bg-neutral-900 dark:text-neutral-400">
            <tr>
              <th className="px-4 py-3 font-medium">Candidate</th>
              <th className="px-4 py-3 font-medium">Job</th>
              <th className="px-4 py-3 font-medium">When</th>
              <th className="px-4 py-3 font-medium">Type</th>
              <th className="px-4 py-3 font-medium">Interviewer</th>
              <th className="px-4 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {interviews.map((iv) => (
              <tr
                key={iv.id}
                className="border-t border-neutral-100 hover:bg-neutral-50 dark:border-neutral-800 dark:hover:bg-neutral-900"
              >
                <td className="px-4 py-3">
                  <Link href={`/interviews/${iv.id}`} className="font-medium hover:underline">
                    {iv.application.candidate.full_name}
                  </Link>
                </td>
                <td className="px-4 py-3 text-neutral-500 dark:text-neutral-400">{iv.application.job.title}</td>
                <td className="px-4 py-3">{iv.scheduled_at ? new Date(iv.scheduled_at).toLocaleString() : '—'}</td>
                <td className="px-4 py-3 text-neutral-500 dark:text-neutral-400">
                  {iv.interview_type.replace('_', ' ')}
                </td>
                <td className="px-4 py-3 text-neutral-500 dark:text-neutral-400">
                  {iv.interviewer?.full_name ?? 'Unassigned'}
                </td>
                <td className="px-4 py-3">
                  <StatusBadge status={iv.status} />
                </td>
              </tr>
            ))}
            {interviews.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-neutral-500 dark:text-neutral-400">
                  No interviews scheduled yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
