'use client';

import { useTransition } from 'react';
import { updateOnboardingTaskStatus } from '@/app/actions/onboarding';
import type { OnboardingTaskStatus } from '@/lib/supabase/types';

const STATUSES: OnboardingTaskStatus[] = ['pending', 'in_progress', 'completed', 'blocked'];

export function TaskStatusSelect({ taskId, status }: { taskId: string; status: OnboardingTaskStatus }) {
  const [pending, startTransition] = useTransition();

  return (
    <select
      defaultValue={status}
      disabled={pending}
      onChange={(e) => {
        const next = e.target.value as OnboardingTaskStatus;
        startTransition(() => {
          updateOnboardingTaskStatus(taskId, next);
        });
      }}
      className="select-compact"
    >
      {STATUSES.map((s) => (
        <option key={s} value={s}>
          {s.replace('_', ' ')}
        </option>
      ))}
    </select>
  );
}
