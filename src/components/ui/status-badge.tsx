const COLOR_MAP: Record<string, string> = {
  // neutral / early stage
  draft: 'bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300',
  applied: 'bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300',
  on_hold: 'bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300',
  // in progress
  published: 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300',
  screening: 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300',
  hr_review: 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300',
  interview_scheduled: 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300',
  interviewed: 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300',
  final_review: 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300',
  offer_pending: 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300',
  offer_sent: 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300',
  // positive
  shortlisted: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300',
  offer_accepted: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300',
  hired: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300',
  onboarding: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300',
  // paused / negative
  paused: 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300',
  closed: 'bg-neutral-200 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400',
  rejected: 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300',
  withdrawn: 'bg-neutral-200 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400',
};

export function StatusBadge({ status }: { status: string }) {
  const classes = COLOR_MAP[status] ?? 'bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300';
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${classes}`}>
      {status.replace(/_/g, ' ')}
    </span>
  );
}
