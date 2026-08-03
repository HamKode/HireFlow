'use client';

import { useActionState } from 'react';
import type { InterviewFormState } from '@/app/actions/interviews';

const inputClass =
  'w-full rounded-md border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-neutral-900 dark:border-neutral-700 dark:bg-neutral-900 dark:focus:border-white';
const labelClass = 'text-sm font-medium';

export function ScheduleInterviewForm({
  action,
  interviewers,
  defaultDurationMinutes = 45,
}: {
  action: (state: InterviewFormState, formData: FormData) => Promise<InterviewFormState>;
  interviewers: { id: string; full_name: string; role: string }[];
  defaultDurationMinutes?: number;
}) {
  const [state, formAction, pending] = useActionState(action, undefined);

  return (
    <form action={formAction} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className={labelClass} htmlFor="scheduled_at">
            Date &amp; time *
          </label>
          <input id="scheduled_at" name="scheduled_at" type="datetime-local" required className={inputClass} />
        </div>
        <div className="space-y-1.5">
          <label className={labelClass} htmlFor="duration_minutes">
            Duration (minutes)
          </label>
          <input
            id="duration_minutes"
            name="duration_minutes"
            type="number"
            defaultValue={defaultDurationMinutes}
            className={inputClass}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className={labelClass} htmlFor="interview_type">
            Interview type
          </label>
          <select id="interview_type" name="interview_type" defaultValue="technical" className={inputClass}>
            <option value="phone_screen">Phone screen</option>
            <option value="technical">Technical</option>
            <option value="behavioral">Behavioral</option>
            <option value="panel">Panel</option>
            <option value="final">Final</option>
            <option value="other">Other</option>
          </select>
        </div>
        <div className="space-y-1.5">
          <label className={labelClass} htmlFor="interviewer_id">
            Interviewer
          </label>
          <select id="interviewer_id" name="interviewer_id" defaultValue="" className={inputClass}>
            <option value="">Unassigned</option>
            {interviewers.map((p) => (
              <option key={p.id} value={p.id}>
                {p.full_name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="space-y-1.5">
        <label className={labelClass} htmlFor="meeting_link">
          Meeting link
        </label>
        <input
          id="meeting_link"
          name="meeting_link"
          placeholder="https://meet.google.com/..."
          className={inputClass}
        />
      </div>

      {state?.error && <p className="text-sm text-red-600">{state.error}</p>}

      <button
        type="submit"
        disabled={pending}
        className="rounded-md bg-neutral-900 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-neutral-700 disabled:opacity-50 dark:bg-white dark:text-neutral-900"
      >
        {pending ? 'Scheduling…' : 'Schedule interview'}
      </button>
    </form>
  );
}
