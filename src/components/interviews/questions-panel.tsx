'use client';

import { useState } from 'react';
import { Sparkles } from 'lucide-react';
import { saveGeneratedQuestions } from '@/app/actions/interviews';
import type { InterviewQuestionsResult } from '@/lib/ai/schemas';

const CATEGORIES: { key: keyof InterviewQuestionsResult; label: string }[] = [
  { key: 'technical_questions', label: 'Technical' },
  { key: 'behavioral_questions', label: 'Behavioral' },
  { key: 'situational_questions', label: 'Situational' },
  { key: 'candidate_specific_questions', label: 'Candidate-specific' },
  { key: 'follow_up_questions', label: 'Follow-up' },
];

export function QuestionsPanel({
  interviewId,
  initialQuestions,
}: {
  interviewId: string;
  initialQuestions: InterviewQuestionsResult | null;
}) {
  const [questions, setQuestions] = useState<InterviewQuestionsResult | null>(initialQuestions);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function generate() {
    setGenerating(true);
    setError(null);
    try {
      const res = await fetch('/api/ai/interview-questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ interview_id: interviewId }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? 'Generation failed.');
        return;
      }
      setQuestions(data.result);
      await saveGeneratedQuestions(interviewId, data.result);
    } catch {
      setError('Generation failed. Check your connection and try again.');
    } finally {
      setGenerating(false);
    }
  }

  return (
    <section className="card space-y-3 p-5">
      <div className="flex items-center justify-between">
        <h2 className="flex items-center gap-1.5 text-sm font-semibold text-ink-900 dark:text-white">
          <Sparkles className="h-4 w-4 text-brand-500" />
          AI-generated interview questions
        </h2>
        <button onClick={generate} disabled={generating} className="btn-secondary px-3! py-1.5! text-xs">
          {generating ? 'Generating…' : questions ? 'Regenerate' : 'Generate questions'}
        </button>
      </div>
      {error && <p className="text-xs text-red-600">{error}</p>}
      {questions ? (
        <div className="space-y-3">
          {CATEGORIES.map(({ key, label }) => {
            const items = questions[key];
            if (!items || items.length === 0) return null;
            return (
              <div key={key}>
                <p className="text-xs font-medium text-ink-500">{label}</p>
                <ul className="mt-1 list-inside list-disc space-y-1 text-sm text-ink-700 dark:text-ink-300">
                  {items.map((q) => (
                    <li key={q}>{q}</li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      ) : (
        <p className="text-sm text-ink-500">No questions generated yet.</p>
      )}
    </section>
  );
}
