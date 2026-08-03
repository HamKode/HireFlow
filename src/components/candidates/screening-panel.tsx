'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Sparkles } from 'lucide-react';
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
    <div className="space-y-2 rounded-xl border border-brand-200/70 bg-brand-50/40 p-3 dark:border-brand-500/20 dark:bg-brand-500/5">
      <div className="flex items-center justify-between">
        <p className="flex items-center gap-1.5 text-xs font-medium text-ink-600 dark:text-ink-300">
          <Sparkles className="h-3.5 w-3.5 text-brand-500" />
          AI Screening
        </p>
        <button onClick={runScreening} disabled={running} className="btn-secondary px-2.5! py-1! text-xs">
          {running ? 'Screening…' : score ? 'Re-run' : 'Run AI screening'}
        </button>
      </div>

      {error && <p className="text-xs text-red-600">{error}</p>}

      {score && (
        <div className="space-y-1.5 text-sm">
          <div className="flex items-baseline gap-2">
            <span className="font-display text-lg font-bold text-ink-900 dark:text-white">
              {score.weighted_final_score}
            </span>
            <span className="text-xs text-ink-500">suggested: {score.routing_decision?.replace(/_/g, ' ')}</span>
          </div>
          <p className="text-xs text-ink-600 dark:text-ink-300">{score.ai_summary}</p>
          {score.matched_skills.length > 0 && (
            <p className="text-xs text-ink-600 dark:text-ink-300">
              <span className="font-medium text-ink-900 dark:text-white">Matched:</span> {score.matched_skills.join(', ')}
            </p>
          )}
          {score.missing_skills.length > 0 && (
            <p className="text-xs text-ink-600 dark:text-ink-300">
              <span className="font-medium text-ink-900 dark:text-white">Missing:</span> {score.missing_skills.join(', ')}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
