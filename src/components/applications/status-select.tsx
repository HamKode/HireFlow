'use client';

import { useTransition } from 'react';
import { updateApplicationStatus } from '@/app/actions/applications';
import type { ApplicationStatus } from '@/lib/supabase/types';

const STATUSES: ApplicationStatus[] = [
  'applied',
  'screening',
  'hr_review',
  'shortlisted',
  'interview_scheduled',
  'interviewed',
  'final_review',
  'offer_pending',
  'offer_sent',
  'offer_accepted',
  'hired',
  'onboarding',
  'rejected',
  'withdrawn',
  'on_hold',
];

export function StatusSelect({ applicationId, status }: { applicationId: string; status: ApplicationStatus }) {
  const [pending, startTransition] = useTransition();

  return (
    <select
      defaultValue={status}
      disabled={pending}
      onChange={(e) => {
        const next = e.target.value as ApplicationStatus;
        startTransition(() => {
          updateApplicationStatus(applicationId, next);
        });
      }}
      className="rounded-md border border-neutral-300 bg-transparent px-2 py-1 text-xs disabled:opacity-50 dark:border-neutral-700"
    >
      {STATUSES.map((s) => (
        <option key={s} value={s}>
          {s.replace(/_/g, ' ')}
        </option>
      ))}
    </select>
  );
}
