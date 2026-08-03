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
      <h1 className="text-xl font-semibold tracking-tight">Onboarding</h1>

      {grouped.size === 0 ? (
        <p className="text-sm text-neutral-500 dark:text-neutral-400">
          No onboarding tasks yet — created automatically once an offer is signed.
        </p>
      ) : (
        <div className="space-y-4">
          {Array.from(grouped.entries()).map(([candidateId, group]) => {
            const completed = group.tasks.filter((t) => t.status === 'completed').length;
            return (
              <div key={candidateId} className="rounded-lg border border-neutral-200 p-4 dark:border-neutral-800">
                <div className="mb-3 flex items-center justify-between">
                  <Link href={`/candidates/${candidateId}`} className="font-medium hover:underline">
                    {group.candidateName}
                  </Link>
                  <span className="text-xs text-neutral-500 dark:text-neutral-400">
                    {completed}/{group.tasks.length} complete
                  </span>
                </div>
                <div className="space-y-2">
                  {group.tasks.map((task) => (
                    <div key={task.id} className="flex items-center justify-between text-sm">
                      <div>
                        <p>{task.task_name}</p>
                        {task.description && (
                          <p className="text-xs text-neutral-500 dark:text-neutral-400">{task.description}</p>
                        )}
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
