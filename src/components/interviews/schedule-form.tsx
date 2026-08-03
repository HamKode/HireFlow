'use client';

import { useActionState } from 'react';
import type { InterviewFormState } from '@/app/actions/interviews';

const inputClass = 'input';
const labelClass = 'label';

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
    <form action={formAction} className="card space-y-4 p-5 sm:p-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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

      {state?.error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-500/10 dark:text-red-300">
          {state.error}
        </p>
      )}

      <button type="submit" disabled={pending} className="btn-primary px-5 py-2.5">
        {pending ? 'Scheduling…' : 'Schedule interview'}
      </button>
    </form>
  );
}
