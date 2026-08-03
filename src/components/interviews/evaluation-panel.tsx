'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export function EvaluationPanel({
  interviewId,
  initialSummary,
  initialNextAction,
}: {
  interviewId: string;
  initialSummary: string | null;
  initialNextAction: string | null;
}) {
  const router = useRouter();
  const [running, setRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function run() {
    setRunning(true);
    setError(null);
    try {
      const res = await fetch('/api/ai/interview-evaluation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ interview_id: interviewId }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? 'Evaluation failed.');
        return;
      }
      router.refresh();
    } catch {
      setError('Evaluation failed. Check your connection and try again.');
    } finally {
      setRunning(false);
    }
  }

  return (
    <section className="space-y-2 rounded-md border border-neutral-200 p-4 dark:border-neutral-800">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold">AI evaluation summary</h2>
        <button
          onClick={run}
          disabled={running}
          className="rounded-md border border-neutral-300 px-3 py-1.5 text-xs font-medium hover:bg-neutral-50 disabled:opacity-50 dark:border-neutral-700 dark:hover:bg-neutral-900"
        >
          {running ? 'Evaluating…' : initialSummary ? 'Re-run' : 'Run AI evaluation'}
        </button>
      </div>
      {error && <p className="text-xs text-red-600">{error}</p>}
      {initialSummary ? (
        <div className="space-y-1.5 text-sm">
          <p>{initialSummary}</p>
          {initialNextAction && (
            <p className="text-neutral-600 dark:text-neutral-400">
              <span className="font-medium">Suggested next step:</span> {initialNextAction}
            </p>
          )}
        </div>
      ) : (
        <p className="text-sm text-neutral-500 dark:text-neutral-400">
          Not evaluated yet — requires interviewer feedback to be submitted first.
        </p>
      )}
    </section>
  );
}
