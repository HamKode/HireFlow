const COLOR_MAP: Record<string, string> = {
  // neutral / early stage
  draft: 'bg-ink-100 text-ink-600 dark:bg-white/5 dark:text-ink-300',
  applied: 'bg-ink-100 text-ink-600 dark:bg-white/5 dark:text-ink-300',
  on_hold: 'bg-ink-100 text-ink-600 dark:bg-white/5 dark:text-ink-300',
  // in progress
  published: 'bg-brand-50 text-brand-700 dark:bg-brand-500/10 dark:text-brand-300',
  screening: 'bg-brand-50 text-brand-700 dark:bg-brand-500/10 dark:text-brand-300',
  hr_review: 'bg-brand-50 text-brand-700 dark:bg-brand-500/10 dark:text-brand-300',
  interview_scheduled: 'bg-brand-50 text-brand-700 dark:bg-brand-500/10 dark:text-brand-300',
  interviewed: 'bg-brand-50 text-brand-700 dark:bg-brand-500/10 dark:text-brand-300',
  final_review: 'bg-brand-50 text-brand-700 dark:bg-brand-500/10 dark:text-brand-300',
  offer_pending: 'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300',
  offer_sent: 'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300',
  // positive
  shortlisted: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300',
  offer_accepted: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300',
  hired: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300',
  onboarding: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300',
  // paused / negative
  paused: 'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300',
  closed: 'bg-ink-100 text-ink-500 dark:bg-white/5 dark:text-ink-400',
  rejected: 'bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-300',
  withdrawn: 'bg-ink-100 text-ink-500 dark:bg-white/5 dark:text-ink-400',
};

const DOT_MAP: Record<string, string> = {
  draft: 'bg-ink-400',
  applied: 'bg-ink-400',
  on_hold: 'bg-ink-400',
  published: 'bg-brand-500',
  screening: 'bg-brand-500',
  hr_review: 'bg-brand-500',
  interview_scheduled: 'bg-brand-500',
  interviewed: 'bg-brand-500',
  final_review: 'bg-brand-500',
  offer_pending: 'bg-amber-500',
  offer_sent: 'bg-amber-500',
  shortlisted: 'bg-emerald-500',
  offer_accepted: 'bg-emerald-500',
  hired: 'bg-emerald-500',
  onboarding: 'bg-emerald-500',
  paused: 'bg-amber-500',
  closed: 'bg-ink-400',
  rejected: 'bg-red-500',
  withdrawn: 'bg-ink-400',
};

export function StatusBadge({ status }: { status: string }) {
  const classes = COLOR_MAP[status] ?? 'bg-ink-100 text-ink-600 dark:bg-white/5 dark:text-ink-300';
  const dot = DOT_MAP[status] ?? 'bg-ink-400';
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium tracking-tight ${classes}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${dot}`} />
      {status.replace(/_/g, ' ')}
    </span>
  );
}
