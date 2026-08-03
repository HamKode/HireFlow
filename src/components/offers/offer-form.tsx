'use client';

import { useActionState } from 'react';
import type { OfferFormState } from '@/app/actions/offers';

const inputClass = 'input';
const labelClass = 'label';

export function OfferForm({
  action,
  defaultEmploymentType,
}: {
  action: (state: OfferFormState, formData: FormData) => Promise<OfferFormState>;
  defaultEmploymentType: string;
}) {
  const [state, formAction, pending] = useActionState(action, undefined);

  return (
    <form action={formAction} className="card space-y-4 p-5 sm:p-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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

      {state?.error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-500/10 dark:text-red-300">
          {state.error}
        </p>
      )}

      <button type="submit" disabled={pending} className="btn-primary px-5 py-2.5">
        {pending ? 'Generating…' : 'Generate offer letter'}
      </button>
    </form>
  );
}
