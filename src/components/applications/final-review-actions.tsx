'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { submitFinalReviewDecision } from '@/app/actions/applications';

const buttonClass =
  'rounded-md border border-neutral-300 px-3 py-1.5 text-xs font-medium hover:bg-neutral-50 disabled:opacity-50 dark:border-neutral-700 dark:hover:bg-neutral-900';

export function FinalReviewActions({ applicationId }: { applicationId: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [showReject, setShowReject] = useState(false);
  const [reason, setReason] = useState('');

  function decide(decision: 'approve' | 'another_interview' | 'hold' | 'reject', rejectReason?: string) {
    startTransition(async () => {
      await submitFinalReviewDecision(applicationId, decision, rejectReason);
      router.refresh();
    });
  }

  return (
    <div className="space-y-2 rounded-md border border-neutral-200 p-3 dark:border-neutral-800">
      <p className="text-xs font-medium text-neutral-500 dark:text-neutral-400">HR final review</p>
      <div className="flex flex-wrap gap-2">
        <button disabled={pending} onClick={() => decide('approve')} className={buttonClass}>
          Approve hire
        </button>
        <button disabled={pending} onClick={() => decide('another_interview')} className={buttonClass}>
          Request another interview
        </button>
        <button disabled={pending} onClick={() => decide('hold')} className={buttonClass}>
          Hold
        </button>
        <button disabled={pending} onClick={() => setShowReject((v) => !v)} className={buttonClass}>
          Reject
        </button>
      </div>
      {showReject && (
        <div className="space-y-2">
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Rejection reason (internal only, not sent to candidate)"
            rows={2}
            className="w-full rounded-md border border-neutral-300 px-3 py-2 text-xs outline-none focus:border-neutral-900 dark:border-neutral-700 dark:bg-neutral-900"
          />
          <button
            disabled={pending}
            onClick={() => decide('reject', reason)}
            className="rounded-md bg-red-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-700 disabled:opacity-50"
          >
            Confirm reject
          </button>
        </div>
      )}
    </div>
  );
}
