'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { CandidateScore } from '@/lib/supabase/types';

export function ScreeningPanel({ applicationId, score }: { applicationId: string; score: CandidateScore | null }) {
  const router = useRouter();
  const [running, setRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function runScreening() {
    setRunning(true);
    setError(null);
    try {
      const res = await fetch('/api/ai/resume-screening', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ application_id: applicationId }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? 'Screening failed.');
        return;
      }
      router.refresh();
    } catch {
      setError('Screening failed. Check your connection and try again.');
    } finally {
      setRunning(false);
    }
  }

  return (
    <div className="space-y-2 rounded-md border border-neutral-200 p-3 dark:border-neutral-800">
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium text-neutral-500 dark:text-neutral-400">AI Screening</p>
        <button
          onClick={runScreening}
          disabled={running}
          className="rounded-md border border-neutral-300 px-2.5 py-1 text-xs font-medium transition hover:bg-neutral-50 disabled:opacity-50 dark:border-neutral-700 dark:hover:bg-neutral-900"
        >
          {running ? 'Screening…' : score ? 'Re-run' : 'Run AI screening'}
        </button>
      </div>

      {error && <p className="text-xs text-red-600">{error}</p>}

      {score && (
        <div className="space-y-1.5 text-sm">
          <div className="flex items-baseline gap-2">
            <span className="text-lg font-semibold">{score.weighted_final_score}</span>
            <span className="text-xs text-neutral-500 dark:text-neutral-400">
              suggested: {score.routing_decision?.replace(/_/g, ' ')}
            </span>
          </div>
          <p className="text-xs text-neutral-600 dark:text-neutral-400">{score.ai_summary}</p>
          {score.matched_skills.length > 0 && (
            <p className="text-xs">
              <span className="font-medium">Matched:</span> {score.matched_skills.join(', ')}
            </p>
          )}
          {score.missing_skills.length > 0 && (
            <p className="text-xs">
              <span className="font-medium">Missing:</span> {score.missing_skills.join(', ')}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
