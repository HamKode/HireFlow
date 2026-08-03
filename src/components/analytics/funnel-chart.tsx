const ORDINAL_STEPS = ['#b8d0ff', '#8ab0ff', '#5586ff', '#2f5eff', '#1a3ff0', '#152fc4'];

export function FunnelChart({ stages }: { stages: { stage: string; count: number }[] }) {
  const max = Math.max(1, ...stages.map((s) => s.count));

  return (
    <div className="card p-4">
      <h3 className="mb-3 text-sm font-semibold text-ink-900 dark:text-white">Recruitment funnel</h3>
      <div className="space-y-2">
        {stages.map((s, i) => {
          const widthPct = Math.max(3, (s.count / max) * 100);
          const pctOfTotal = max > 0 ? Math.round((s.count / max) * 1000) / 10 : 0;
          return (
            <div key={s.stage} className="flex items-center gap-3">
              <span className="w-24 shrink-0 text-xs text-ink-500">{s.stage}</span>
              <div className="h-6 flex-1 overflow-hidden rounded-sm bg-ink-100 dark:bg-white/5">
                <div
                  className="h-full rounded-r-sm transition-all duration-500"
                  style={{ width: `${widthPct}%`, backgroundColor: ORDINAL_STEPS[i % ORDINAL_STEPS.length] }}
                />
              </div>
              <span className="w-20 shrink-0 text-right text-xs font-medium tabular-nums text-ink-700 dark:text-ink-300">
                {s.count} <span className="text-ink-400">({pctOfTotal}%)</span>
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
