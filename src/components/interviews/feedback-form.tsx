'use client';

import { useActionState } from 'react';
import type { FeedbackFormState } from '@/app/actions/interviews';
import type { InterviewFeedback } from '@/lib/supabase/types';

const inputClass =
  'w-full rounded-md border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-neutral-900 dark:border-neutral-700 dark:bg-neutral-900 dark:focus:border-white';
const labelClass = 'text-sm font-medium';

const RATING_FIELDS: { key: keyof InterviewFeedback; label: string }[] = [
  { key: 'technical_knowledge', label: 'Technical knowledge' },
  { key: 'problem_solving', label: 'Problem solving' },
  { key: 'communication', label: 'Communication' },
  { key: 'role_fit', label: 'Role fit' },
  { key: 'experience_rating', label: 'Experience' },
];

export function FeedbackForm({
  action,
  initial,
}: {
  action: (state: FeedbackFormState, formData: FormData) => Promise<FeedbackFormState>;
  initial?: InterviewFeedback | null;
}) {
  const [state, formAction, pending] = useActionState(action, undefined);

  return (
    <form action={formAction} className="space-y-4">
      <div className="grid grid-cols-5 gap-3">
        {RATING_FIELDS.map(({ key, label }) => (
          <div key={key} className="space-y-1.5">
            <label className={labelClass} htmlFor={key}>
              {label}
            </label>
            <input
              id={key}
              name={key}
              type="number"
              min={1}
              max={10}
              defaultValue={(initial?.[key] as number | undefined) ?? ''}
              className={inputClass}
            />
          </div>
        ))}
      </div>

      <div className="space-y-1.5">
        <label className={labelClass} htmlFor="strengths">
          Strengths
        </label>
        <textarea id="strengths" name="strengths" rows={2} defaultValue={initial?.strengths ?? ''} className={inputClass} />
      </div>
      <div className="space-y-1.5">
        <label className={labelClass} htmlFor="weaknesses">
          Weaknesses
        </label>
        <textarea
          id="weaknesses"
          name="weaknesses"
          rows={2}
          defaultValue={initial?.weaknesses ?? ''}
          className={inputClass}
        />
      </div>
      <div className="space-y-1.5">
        <label className={labelClass} htmlFor="notes">
          Additional notes
        </label>
        <textarea id="notes" name="notes" rows={3} defaultValue={initial?.notes ?? ''} className={inputClass} />
      </div>

      <div className="space-y-1.5">
        <label className={labelClass} htmlFor="recommendation">
          Recommendation
        </label>
        <select id="recommendation" name="recommendation" defaultValue={initial?.recommendation ?? ''} className={inputClass}>
          <option value="" disabled>
            Select…
          </option>
          <option value="strong_hire">Strong Hire</option>
          <option value="hire">Hire</option>
          <option value="hold">Hold</option>
          <option value="no_hire">No Hire</option>
        </select>
      </div>

      {state?.error && <p className="text-sm text-red-600">{state.error}</p>}

      <button
        type="submit"
        disabled={pending}
        className="rounded-md bg-neutral-900 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-neutral-700 disabled:opacity-50 dark:bg-white dark:text-neutral-900"
      >
        {pending ? 'Saving…' : initial ? 'Update feedback' : 'Submit feedback'}
      </button>
    </form>
  );
}
