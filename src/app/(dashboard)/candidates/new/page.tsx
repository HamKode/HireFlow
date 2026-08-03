'use client';

import { useActionState } from 'react';
import { createCandidate } from '@/app/actions/candidates';

const inputClass =
  'w-full rounded-md border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-neutral-900 dark:border-neutral-700 dark:bg-neutral-900 dark:focus:border-white';
const labelClass = 'text-sm font-medium';

export default function NewCandidatePage() {
  const [state, action, pending] = useActionState(createCandidate, undefined);

  return (
    <div className="max-w-xl space-y-6">
      <h1 className="text-xl font-semibold tracking-tight">Add candidate</h1>
      <form action={action} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className={labelClass} htmlFor="full_name">
              Full name *
            </label>
            <input id="full_name" name="full_name" required className={inputClass} />
          </div>
          <div className="space-y-1.5">
            <label className={labelClass} htmlFor="email">
              Email *
            </label>
            <input id="email" name="email" type="email" required className={inputClass} />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className={labelClass} htmlFor="phone">
              Phone
            </label>
            <input id="phone" name="phone" className={inputClass} />
          </div>
          <div className="space-y-1.5">
            <label className={labelClass} htmlFor="location">
              Location
            </label>
            <input id="location" name="location" className={inputClass} />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <label className={labelClass} htmlFor="linkedin_url">
              LinkedIn
            </label>
            <input id="linkedin_url" name="linkedin_url" className={inputClass} />
          </div>
          <div className="space-y-1.5">
            <label className={labelClass} htmlFor="github_url">
              GitHub
            </label>
            <input id="github_url" name="github_url" className={inputClass} />
          </div>
          <div className="space-y-1.5">
            <label className={labelClass} htmlFor="portfolio_url">
              Portfolio
            </label>
            <input id="portfolio_url" name="portfolio_url" className={inputClass} />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className={labelClass} htmlFor="years_experience">
              Years of experience
            </label>
            <input id="years_experience" name="years_experience" type="number" step="0.5" className={inputClass} />
          </div>
          <div className="space-y-1.5">
            <label className={labelClass} htmlFor="education">
              Education
            </label>
            <input id="education" name="education" className={inputClass} />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className={labelClass} htmlFor="technical_skills">
            Technical skills (comma separated)
          </label>
          <input id="technical_skills" name="technical_skills" className={inputClass} />
        </div>

        {state?.error && <p className="text-sm text-red-600">{state.error}</p>}

        <button
          type="submit"
          disabled={pending}
          className="rounded-md bg-neutral-900 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-neutral-700 disabled:opacity-50 dark:bg-white dark:text-neutral-900"
        >
          {pending ? 'Saving…' : 'Add candidate'}
        </button>
      </form>
    </div>
  );
}
