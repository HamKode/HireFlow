'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { submitFinalReviewDecision } from '@/app/actions/applications';

const buttonClass = 'btn-secondary px-3! py-1.5! text-xs';

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
    <div className="space-y-2 rounded-xl border border-ink-200/70 p-3 dark:border-white/10">
      <p className="text-xs font-medium text-ink-500">HR final review</p>
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
            className="input text-xs"
          />
          <button disabled={pending} onClick={() => decide('reject', reason)} className="btn-danger px-3! py-1.5! text-xs">
            Confirm reject
          </button>
        </div>
      )}
    </div>
  );
}
