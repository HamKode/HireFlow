import Link from 'next/link';
import { Briefcase, FileText, ScanSearch, Star, CalendarClock, FileSignature, PartyPopper, ArrowRight } from 'lucide-react';
import { getDashboardStats } from '@/lib/data/stats';

const CARDS = [
  { key: 'openJobs', label: 'Open Positions', icon: Briefcase },
  { key: 'applications', label: 'Applications', icon: FileText },
  { key: 'inScreening', label: 'In Screening', icon: ScanSearch },
  { key: 'shortlisted', label: 'Shortlisted', icon: Star },
  { key: 'interviews', label: 'Interviews', icon: CalendarClock },
  { key: 'offers', label: 'Offers', icon: FileSignature },
  { key: 'hired', label: 'Hired', icon: PartyPopper },
] as const;

export default async function DashboardPage() {
  const stats = await getDashboardStats();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight text-ink-900 dark:text-white">Dashboard</h1>
        <p className="mt-1 text-sm text-ink-500">A snapshot of where every candidate stands right now.</p>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {CARDS.map((card, i) => {
          const Icon = card.icon;
          return (
            <div
              key={card.key}
              className="animate-fade-up card group p-5 transition-shadow hover:shadow-lg"
              style={{ animationDelay: `${i * 40}ms` }}
            >
              <div className="flex items-center justify-between">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-50 text-brand-600 transition-colors group-hover:bg-brand-100 dark:bg-brand-500/10 dark:text-brand-300">
                  <Icon className="h-4.5 w-4.5" />
                </span>
              </div>
              <p className="mt-4 font-display text-3xl font-bold tracking-tight text-ink-900 dark:text-white">
                {stats[card.key]}
              </p>
              <p className="mt-1 text-xs font-medium text-ink-500">{card.label}</p>
            </div>
          );
        })}
      </div>

      <Link
        href="/analytics"
        className="card group flex items-center justify-between p-5 transition-shadow hover:shadow-lg"
      >
        <div>
          <p className="text-sm font-semibold text-ink-900 dark:text-white">See the full recruitment picture</p>
          <p className="mt-1 text-sm text-ink-500">
            Funnel, source/status breakdowns, hire rate, and time-to-hire on the Analytics page.
          </p>
        </div>
        <ArrowRight className="h-5 w-5 shrink-0 text-brand-500 transition-transform group-hover:translate-x-1" />
      </Link>
    </div>
  );
}
