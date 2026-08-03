import Link from 'next/link';
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
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold tracking-tight">Candidates</h1>
        <Link
          href="/candidates/new"
          className="rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-neutral-700 dark:bg-white dark:text-neutral-900"
        >
          Add candidate
        </Link>
      </div>

      <form className="flex gap-3">
        <input
          name="q"
          defaultValue={params.q}
          placeholder="Search by name or email…"
          className="w-72 rounded-md border border-neutral-300 px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-900"
        />
        <button
          type="submit"
          className="rounded-md border border-neutral-300 px-4 py-2 text-sm font-medium dark:border-neutral-700"
        >
          Search
        </button>
      </form>

      <div className="overflow-hidden rounded-lg border border-neutral-200 dark:border-neutral-800">
        <table className="w-full text-sm">
          <thead className="bg-neutral-50 text-left text-xs uppercase text-neutral-500 dark:bg-neutral-900 dark:text-neutral-400">
            <tr>
              <th className="px-4 py-3 font-medium">Name</th>
              <th className="px-4 py-3 font-medium">Email</th>
              <th className="px-4 py-3 font-medium">Location</th>
              <th className="px-4 py-3 font-medium">Experience</th>
              <th className="px-4 py-3 font-medium">Skills</th>
            </tr>
          </thead>
          <tbody>
            {candidates.map((c) => (
              <tr
                key={c.id}
                className="border-t border-neutral-100 hover:bg-neutral-50 dark:border-neutral-800 dark:hover:bg-neutral-900"
              >
                <td className="px-4 py-3">
                  <Link href={`/candidates/${c.id}`} className="font-medium hover:underline">
                    {c.full_name}
                  </Link>
                </td>
                <td className="px-4 py-3 text-neutral-500 dark:text-neutral-400">{c.email}</td>
                <td className="px-4 py-3 text-neutral-500 dark:text-neutral-400">{c.location ?? '—'}</td>
                <td className="px-4 py-3">{c.years_experience ? `${c.years_experience} yrs` : '—'}</td>
                <td className="px-4 py-3 text-neutral-500 dark:text-neutral-400">
                  {c.technical_skills.slice(0, 3).join(', ') || '—'}
                </td>
              </tr>
            ))}
            {candidates.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-neutral-500 dark:text-neutral-400">
                  No candidates yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
