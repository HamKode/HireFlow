export function BarList({ title, items }: { title: string; items: { label: string; value: number }[] }) {
  const max = Math.max(1, ...items.map((i) => i.value));

  return (
    <div className="card p-4">
      <h3 className="mb-3 text-sm font-semibold text-ink-900 dark:text-white">{title}</h3>
      {items.length === 0 ? (
        <p className="text-sm text-ink-400">No data yet.</p>
      ) : (
        <div className="space-y-2.5">
          {items.map((item) => (
            <div key={item.label} className="flex items-center gap-3">
              <span className="w-32 shrink-0 truncate text-xs text-ink-500">{item.label}</span>
              <div className="h-4 flex-1 overflow-hidden rounded-sm bg-ink-100 dark:bg-white/5">
                <div
                  className="h-full rounded-r-sm bg-brand-500 dark:bg-brand-400"
                  style={{ width: `${Math.max(2, (item.value / max) * 100)}%` }}
                />
              </div>
              <span className="w-8 shrink-0 text-right text-xs font-medium tabular-nums text-ink-700 dark:text-ink-300">
                {item.value}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
