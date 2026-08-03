'use client';

import { useState, useTransition } from 'react';
import { Trash2 } from 'lucide-react';
import { deleteCandidate } from '@/app/actions/candidates';

export function DeleteCandidateButton({ candidateId, candidateName }: { candidateId: string; candidateName: string }) {
  const [confirming, setConfirming] = useState(false);
  const [pending, startTransition] = useTransition();

  if (!confirming) {
    return (
      <button
        onClick={() => setConfirming(true)}
        className="inline-flex items-center gap-2 rounded-xl border border-red-200 px-4 py-2.5 text-sm font-medium text-red-600 transition-colors hover:bg-red-50 dark:border-red-500/30 dark:hover:bg-red-500/10"
      >
        <Trash2 className="h-3.5 w-3.5" />
        Delete candidate
      </button>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-2 rounded-xl border border-red-200 px-3 py-2 dark:border-red-500/30">
      <span className="text-sm text-red-700 dark:text-red-400">
        Permanently delete {candidateName} and all their applications, interviews, and offers?
      </span>
      <button
        disabled={pending}
        onClick={() => startTransition(() => deleteCandidate(candidateId))}
        className="btn-danger px-2.5! py-1! text-xs"
      >
        {pending ? 'Deleting…' : 'Yes, delete'}
      </button>
      <button disabled={pending} onClick={() => setConfirming(false)} className="btn-secondary px-2.5! py-1! text-xs">
        Cancel
      </button>
    </div>
  );
}
