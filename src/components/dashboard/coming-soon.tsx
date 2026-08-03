export function ComingSoon({ title, phase }: { title: string; phase: string }) {
  return (
    <div className="space-y-2">
      <h1 className="text-xl font-semibold tracking-tight">{title}</h1>
      <p className="text-sm text-neutral-500 dark:text-neutral-400">Coming in {phase} of the build roadmap.</p>
    </div>
  );
}
