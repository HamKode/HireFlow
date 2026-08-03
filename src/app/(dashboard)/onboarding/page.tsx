import Link from 'next/link';
import { listOnboardingTasks } from '@/lib/data/onboarding';
import { TaskStatusSelect } from '@/components/onboarding/task-status-select';

export default async function OnboardingPage() {
  const tasks = await listOnboardingTasks();

  const grouped = new Map<string, { candidateName: string; tasks: typeof tasks }>();
  for (const task of tasks) {
    const key = task.candidate_id;
    if (!grouped.has(key)) {
      grouped.set(key, { candidateName: task.candidate.full_name, tasks: [] });
    }
    grouped.get(key)!.tasks.push(task);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight text-ink-900 dark:text-white">Onboarding</h1>
        <p className="mt-1 text-sm text-ink-500">Checklists created automatically once an offer is signed.</p>
      </div>

      {grouped.size === 0 ? (
        <p className="text-sm text-ink-500">No onboarding tasks yet — created automatically once an offer is signed.</p>
      ) : (
        <div className="space-y-4">
          {Array.from(grouped.entries()).map(([candidateId, group]) => {
            const completed = group.tasks.filter((t) => t.status === 'completed').length;
            const pct = Math.round((completed / group.tasks.length) * 100);
            return (
              <div key={candidateId} className="card p-4 sm:p-5">
                <div className="mb-3 flex items-center justify-between">
                  <Link href={`/candidates/${candidateId}`} className="font-medium text-ink-900 hover:text-brand-600 dark:text-white">
                    {group.candidateName}
                  </Link>
                  <span className="text-xs font-medium text-ink-500">
                    {completed}/{group.tasks.length} complete
                  </span>
                </div>
                <div className="mb-4 h-1.5 overflow-hidden rounded-full bg-ink-100 dark:bg-white/5">
                  <div className="h-full rounded-full bg-emerald-500 transition-all duration-500" style={{ width: `${pct}%` }} />
                </div>
                <div className="space-y-2 divide-y divide-ink-100 dark:divide-white/10">
                  {group.tasks.map((task) => (
                    <div key={task.id} className="flex items-center justify-between gap-3 pt-2 text-sm first:pt-0">
                      <div className="min-w-0 flex-1">
                        <p className="text-ink-900 dark:text-white">{task.task_name}</p>
                        {task.description && <p className="text-xs text-ink-500">{task.description}</p>}
                      </div>
                      <TaskStatusSelect taskId={task.id} status={task.status} />
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
