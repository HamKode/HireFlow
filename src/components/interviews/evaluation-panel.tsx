'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Sparkles } from 'lucide-react';

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
    <section className="card space-y-2 p-5">
      <div className="flex items-center justify-between">
        <h2 className="flex items-center gap-1.5 text-sm font-semibold text-ink-900 dark:text-white">
          <Sparkles className="h-4 w-4 text-brand-500" />
          AI evaluation summary
        </h2>
        <button onClick={run} disabled={running} className="btn-secondary px-3! py-1.5! text-xs">
          {running ? 'Evaluating…' : initialSummary ? 'Re-run' : 'Run AI evaluation'}
        </button>
      </div>
      {error && <p className="text-xs text-red-600">{error}</p>}
      {initialSummary ? (
        <div className="space-y-1.5 text-sm text-ink-700 dark:text-ink-300">
          <p>{initialSummary}</p>
          {initialNextAction && (
            <p className="text-ink-500">
              <span className="font-medium text-ink-900 dark:text-white">Suggested next step:</span> {initialNextAction}
            </p>
          )}
        </div>
      ) : (
        <p className="text-sm text-ink-500">Not evaluated yet — requires interviewer feedback to be submitted first.</p>
      )}
    </section>
  );
}
