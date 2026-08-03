import Link from 'next/link';
import { UserPlus } from 'lucide-react';
import { listCandidates } from '@/lib/data/candidates';

export default async function CandidatesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const params = await searchParams;
  const candidates = await listCandidates(params.q);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-ink-900 dark:text-white">Candidates</h1>
          <p className="mt-1 text-sm text-ink-500">Everyone in your talent pool, across every job.</p>
        </div>
        <Link href="/candidates/new" className="btn-primary">
          <UserPlus className="h-4 w-4" />
          Add candidate
        </Link>
      </div>

      <form className="flex flex-col gap-3 sm:flex-row">
        <input name="q" defaultValue={params.q} placeholder="Search by name or email…" className="input sm:w-72" />
        <button type="submit" className="btn-secondary">
          Search
        </button>
      </form>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-ink-50 text-left text-xs font-medium uppercase tracking-wide text-ink-500 dark:bg-white/5">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Location</th>
                <th className="px-4 py-3">Experience</th>
                <th className="px-4 py-3">Skills</th>
              </tr>
            </thead>
            <tbody>
              {candidates.map((c) => (
                <tr
                  key={c.id}
                  className="border-t border-ink-100 transition-colors hover:bg-ink-50/70 dark:border-white/10 dark:hover:bg-white/5"
                >
                  <td className="px-4 py-3">
                    <Link href={`/candidates/${c.id}`} className="font-medium text-ink-900 hover:text-brand-600 dark:text-white">
                      {c.full_name}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-ink-500">{c.email}</td>
                  <td className="px-4 py-3 text-ink-500">{c.location ?? '—'}</td>
                  <td className="px-4 py-3 text-ink-700 dark:text-ink-300">
                    {c.years_experience ? `${c.years_experience} yrs` : '—'}
                  </td>
                  <td className="px-4 py-3 text-ink-500">{c.technical_skills.slice(0, 3).join(', ') || '—'}</td>
                </tr>
              ))}
              {candidates.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-10 text-center text-sm text-ink-400">
                    No candidates yet.
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
