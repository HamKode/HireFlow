export function BarList({ title, items }: { title: string; items: { label: string; value: number }[] }) {
  const max = Math.max(1, ...items.map((i) => i.value));

  return (
    <div className="rounded-lg border border-neutral-200 p-4 dark:border-neutral-800">
      <h3 className="mb-3 text-sm font-semibold">{title}</h3>
      {items.length === 0 ? (
        <p className="text-sm text-neutral-500 dark:text-neutral-400">No data yet.</p>
      ) : (
        <div className="space-y-2.5">
          {items.map((item) => (
            <div key={item.label} className="flex items-center gap-3">
              <span className="w-32 shrink-0 truncate text-xs text-neutral-600 dark:text-neutral-400">{item.label}</span>
              <div className="h-4 flex-1 overflow-hidden rounded-sm bg-neutral-100 dark:bg-neutral-900">
                <div
                  className="h-full rounded-r-sm bg-[#2a78d6] dark:bg-[#3987e5]"
                  style={{ width: `${Math.max(2, (item.value / max) * 100)}%` }}
                />
              </div>
              <span className="w-8 shrink-0 text-right text-xs font-medium tabular-nums">{item.value}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
