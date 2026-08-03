'use client';

import { useActionState } from 'react';
import type { Job } from '@/lib/supabase/types';
import type { JobFormState } from '@/app/actions/jobs';

const inputClass =
  'w-full rounded-md border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-neutral-900 dark:border-neutral-700 dark:bg-neutral-900 dark:focus:border-white';
const labelClass = 'text-sm font-medium';

export function JobForm({
  action,
  initial,
  submitLabel,
}: {
  action: (state: JobFormState, formData: FormData) => Promise<JobFormState>;
  initial?: Job;
  submitLabel: string;
}) {
  const [state, formAction, pending] = useActionState(action, undefined);

  return (
    <form action={formAction} className="max-w-2xl space-y-5">
      <div className="space-y-1.5">
        <label className={labelClass} htmlFor="title">
          Job title *
        </label>
        <input id="title" name="title" defaultValue={initial?.title} required className={inputClass} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className={labelClass} htmlFor="department">
            Department
          </label>
          <input id="department" name="department" defaultValue={initial?.department ?? ''} className={inputClass} />
        </div>
        <div className="space-y-1.5">
          <label className={labelClass} htmlFor="location">
            Location
          </label>
          <input id="location" name="location" defaultValue={initial?.location ?? ''} className={inputClass} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className={labelClass} htmlFor="employment_type">
            Employment type
          </label>
          <select
            id="employment_type"
            name="employment_type"
            defaultValue={initial?.employment_type ?? 'full_time'}
            className={inputClass}
          >
            <option value="full_time">Full-time</option>
            <option value="part_time">Part-time</option>
            <option value="contract">Contract</option>
            <option value="internship">Internship</option>
            <option value="temporary">Temporary</option>
          </select>
        </div>
        <div className="space-y-1.5">
          <label className={labelClass} htmlFor="positions_count">
            Number of positions
          </label>
          <input
            id="positions_count"
            name="positions_count"
            type="number"
            min={1}
            defaultValue={initial?.positions_count ?? 1}
            className={inputClass}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className={labelClass} htmlFor="salary_min">
            Salary min
          </label>
          <input
            id="salary_min"
            name="salary_min"
            type="number"
            defaultValue={initial?.salary_min ?? ''}
            className={inputClass}
          />
        </div>
        <div className="space-y-1.5">
          <label className={labelClass} htmlFor="salary_max">
            Salary max
          </label>
          <input
            id="salary_max"
            name="salary_max"
            type="number"
            defaultValue={initial?.salary_max ?? ''}
            className={inputClass}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className={labelClass} htmlFor="experience_required">
            Experience required
          </label>
          <input
            id="experience_required"
            name="experience_required"
            placeholder="e.g. 2+ years"
            defaultValue={initial?.experience_required ?? ''}
            className={inputClass}
          />
        </div>
        <div className="space-y-1.5">
          <label className={labelClass} htmlFor="education">
            Education
          </label>
          <input id="education" name="education" defaultValue={initial?.education ?? ''} className={inputClass} />
        </div>
      </div>

      <div className="space-y-1.5">
        <label className={labelClass} htmlFor="required_skills">
          Required skills (comma separated)
        </label>
        <input
          id="required_skills"
          name="required_skills"
          defaultValue={initial?.required_skills?.join(', ')}
          className={inputClass}
        />
      </div>
      <div className="space-y-1.5">
        <label className={labelClass} htmlFor="preferred_skills">
          Preferred skills (comma separated)
        </label>
        <input
          id="preferred_skills"
          name="preferred_skills"
          defaultValue={initial?.preferred_skills?.join(', ')}
          className={inputClass}
        />
      </div>

      <div className="space-y-1.5">
        <label className={labelClass} htmlFor="responsibilities">
          Responsibilities
        </label>
        <textarea
          id="responsibilities"
          name="responsibilities"
          rows={4}
          defaultValue={initial?.responsibilities ?? ''}
          className={inputClass}
        />
      </div>

      <div className="space-y-1.5">
        <label className={labelClass} htmlFor="description">
          Job description
        </label>
        <textarea
          id="description"
          name="description"
          rows={6}
          defaultValue={initial?.description ?? ''}
          className={inputClass}
          placeholder="Write manually, or generate one with AI once Phase 3 is live."
        />
      </div>

      <div className="space-y-1.5">
        <label className={labelClass} htmlFor="application_deadline">
          Application deadline
        </label>
        <input
          id="application_deadline"
          name="application_deadline"
          type="date"
          defaultValue={initial?.application_deadline ?? ''}
          className={inputClass}
        />
      </div>

      {state?.error && <p className="text-sm text-red-600">{state.error}</p>}

      <button
        type="submit"
        disabled={pending}
        className="rounded-md bg-neutral-900 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-neutral-700 disabled:opacity-50 dark:bg-white dark:text-neutral-900"
      >
        {pending ? 'Saving…' : submitLabel}
      </button>
    </form>
  );
}
