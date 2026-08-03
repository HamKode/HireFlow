'use client';

import { useState, useTransition } from 'react';
import { deleteCandidate } from '@/app/actions/candidates';

export function DeleteCandidateButton({ candidateId, candidateName }: { candidateId: string; candidateName: string }) {
  const [confirming, setConfirming] = useState(false);
  const [pending, startTransition] = useTransition();

  if (!confirming) {
    return (
      <button
        onClick={() => setConfirming(true)}
        className="rounded-md border border-red-300 px-3 py-1.5 text-sm font-medium text-red-600 transition hover:bg-red-50 dark:border-red-900 dark:hover:bg-red-950"
      >
        Delete candidate
      </button>
    );
  }

  return (
    <div className="flex items-center gap-2 rounded-md border border-red-300 px-3 py-1.5 dark:border-red-900">
      <span className="text-sm text-red-700 dark:text-red-400">
        Permanently delete {candidateName} and all their applications, interviews, and offers?
      </span>
      <button
        disabled={pending}
        onClick={() => startTransition(() => deleteCandidate(candidateId))}
        className="rounded-md bg-red-600 px-2.5 py-1 text-xs font-medium text-white hover:bg-red-700 disabled:opacity-50"
      >
        {pending ? 'Deleting…' : 'Yes, delete'}
      </button>
      <button
        disabled={pending}
        onClick={() => setConfirming(false)}
        className="rounded-md border border-neutral-300 px-2.5 py-1 text-xs font-medium hover:bg-neutral-50 disabled:opacity-50 dark:border-neutral-700 dark:hover:bg-neutral-900"
      >
        Cancel
      </button>
    </div>
  );
}
