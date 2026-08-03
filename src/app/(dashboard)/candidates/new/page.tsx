'use client';

import { useActionState } from 'react';
import { createCandidate } from '@/app/actions/candidates';

const inputClass = 'input';
const labelClass = 'label';

export default function NewCandidatePage() {
  const [state, action, pending] = useActionState(createCandidate, undefined);

  return (
    <div className="max-w-xl space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight text-ink-900 dark:text-white">Add candidate</h1>
        <p className="mt-1 text-sm text-ink-500">Enter their details manually — no resume upload required.</p>
      </div>
      <form action={action} className="card space-y-4 p-5 sm:p-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
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

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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

        {state?.error && (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-500/10 dark:text-red-300">
            {state.error}
          </p>
        )}

        <button type="submit" disabled={pending} className="btn-primary px-5 py-2.5">
          {pending ? 'Saving…' : 'Add candidate'}
        </button>
      </form>
    </div>
  );
}
