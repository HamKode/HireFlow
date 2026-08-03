'use client';

import { useActionState } from 'react';
import type { OfferFormState } from '@/app/actions/offers';

const inputClass =
  'w-full rounded-md border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-neutral-900 dark:border-neutral-700 dark:bg-neutral-900 dark:focus:border-white';
const labelClass = 'text-sm font-medium';

export function OfferForm({
  action,
  defaultEmploymentType,
}: {
  action: (state: OfferFormState, formData: FormData) => Promise<OfferFormState>;
  defaultEmploymentType: string;
}) {
  const [state, formAction, pending] = useActionState(action, undefined);

  return (
    <form action={formAction} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className={labelClass} htmlFor="salary">
            Annual salary (USD) *
          </label>
          <input id="salary" name="salary" type="number" required className={inputClass} />
        </div>
        <div className="space-y-1.5">
          <label className={labelClass} htmlFor="employment_type">
            Employment type
          </label>
          <select id="employment_type" name="employment_type" defaultValue={defaultEmploymentType} className={inputClass}>
            <option value="full_time">Full-time</option>
            <option value="part_time">Part-time</option>
            <option value="contract">Contract</option>
            <option value="internship">Internship</option>
            <option value="temporary">Temporary</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className={labelClass} htmlFor="joining_date">
            Joining date
          </label>
          <input id="joining_date" name="joining_date" type="date" className={inputClass} />
        </div>
        <div className="space-y-1.5">
          <label className={labelClass} htmlFor="acceptance_deadline">
            Acceptance deadline
          </label>
          <input id="acceptance_deadline" name="acceptance_deadline" type="date" className={inputClass} />
        </div>
      </div>

      <div className="space-y-1.5">
        <label className={labelClass} htmlFor="benefits">
          Benefits
        </label>
        <textarea id="benefits" name="benefits" rows={3} className={inputClass} placeholder="Health insurance, paid time off, ..." />
      </div>

      {state?.error && <p className="text-sm text-red-600">{state.error}</p>}

      <button
        type="submit"
        disabled={pending}
        className="rounded-md bg-neutral-900 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-neutral-700 disabled:opacity-50 dark:bg-white dark:text-neutral-900"
      >
        {pending ? 'Generating…' : 'Generate offer letter'}
      </button>
    </form>
  );
}
