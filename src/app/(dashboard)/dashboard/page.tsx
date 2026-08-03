import Link from 'next/link';
import { getDashboardStats } from '@/lib/data/stats';

const CARDS = [
  { key: 'openJobs', label: 'Open Positions' },
  { key: 'applications', label: 'Applications' },
  { key: 'inScreening', label: 'In Screening' },
  { key: 'shortlisted', label: 'Shortlisted' },
  { key: 'interviews', label: 'Interviews' },
  { key: 'offers', label: 'Offers' },
  { key: 'hired', label: 'Hired' },
] as const;

export default async function DashboardPage() {
  const stats = await getDashboardStats();

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold tracking-tight">Dashboard</h1>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {CARDS.map((card) => (
          <div
            key={card.key}
            className="rounded-lg border border-neutral-200 p-4 dark:border-neutral-800"
          >
            <p className="text-xs font-medium text-neutral-500 dark:text-neutral-400">{card.label}</p>
            <p className="mt-2 text-2xl font-semibold">{stats[card.key]}</p>
          </div>
        ))}
      </div>
      <p className="text-sm text-neutral-500 dark:text-neutral-400">
        See the{' '}
        <Link href="/analytics" className="font-medium text-neutral-900 underline dark:text-white">
          Analytics
        </Link>{' '}
        page for the recruitment funnel, source/status breakdowns, and hiring rates.
      </p>
    </div>
  );
}
