const ORDINAL_STEPS = ['#86b6ef', '#6da7ec', '#5598e7', '#3987e5', '#2a78d6', '#256abf'];

export function FunnelChart({ stages }: { stages: { stage: string; count: number }[] }) {
  const max = Math.max(1, ...stages.map((s) => s.count));

  return (
    <div className="rounded-lg border border-neutral-200 p-4 dark:border-neutral-800">
      <h3 className="mb-3 text-sm font-semibold">Recruitment funnel</h3>
      <div className="space-y-2">
        {stages.map((s, i) => {
          const widthPct = Math.max(3, (s.count / max) * 100);
          const pctOfTotal = max > 0 ? Math.round((s.count / max) * 1000) / 10 : 0;
          return (
            <div key={s.stage} className="flex items-center gap-3">
              <span className="w-24 shrink-0 text-xs text-neutral-600 dark:text-neutral-400">{s.stage}</span>
              <div className="h-6 flex-1 overflow-hidden rounded-sm bg-neutral-100 dark:bg-neutral-900">
                <div
                  className="h-full rounded-r-sm"
                  style={{ width: `${widthPct}%`, backgroundColor: ORDINAL_STEPS[i % ORDINAL_STEPS.length] }}
                />
              </div>
              <span className="w-20 shrink-0 text-right text-xs font-medium tabular-nums">
                {s.count} <span className="text-neutral-400">({pctOfTotal}%)</span>
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
