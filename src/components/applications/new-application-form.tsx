'use client';

import { useActionState } from 'react';
import type { ApplicationFormState } from '@/app/actions/applications';

const inputClass =
  'w-full rounded-md border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-neutral-900 dark:border-neutral-700 dark:bg-neutral-900 dark:focus:border-white';
const labelClass = 'text-sm font-medium';

export function NewApplicationForm({
  action,
  candidates,
  jobs,
  defaultCandidateId,
}: {
  action: (state: ApplicationFormState, formData: FormData) => Promise<ApplicationFormState>;
  candidates: { id: string; full_name: string; email: string }[];
  jobs: { id: string; title: string }[];
  defaultCandidateId?: string;
}) {
  const [state, formAction, pending] = useActionState(action, undefined);

  return (
    <form action={formAction} className="space-y-4">
      <div className="space-y-1.5">
        <label className={labelClass} htmlFor="candidate_id">
          Candidate *
        </label>
        <select id="candidate_id" name="candidate_id" required defaultValue={defaultCandidateId ?? ''} className={inputClass}>
          <option value="" disabled>
            Select a candidate
          </option>
          {candidates.map((c) => (
            <option key={c.id} value={c.id}>
              {c.full_name} ({c.email})
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-1.5">
        <label className={labelClass} htmlFor="job_id">
          Job *
        </label>
        <select id="job_id" name="job_id" required defaultValue="" className={inputClass}>
          <option value="" disabled>
            Select a job
          </option>
          {jobs.map((j) => (
            <option key={j.id} value={j.id}>
              {j.title}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-1.5">
        <label className={labelClass} htmlFor="source">
          Source
        </label>
        <select id="source" name="source" defaultValue="other" className={inputClass}>
          <option value="linkedin">LinkedIn</option>
          <option value="indeed">Indeed</option>
          <option value="company_website">Company website</option>
          <option value="referral">Referral</option>
          <option value="recruiter">Recruiter</option>
          <option value="job_board">Job board</option>
          <option value="social_media">Social media</option>
          <option value="other">Other</option>
        </select>
      </div>

      {state?.error && <p className="text-sm text-red-600">{state.error}</p>}

      <button
        type="submit"
        disabled={pending}
        className="rounded-md bg-neutral-900 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-neutral-700 disabled:opacity-50 dark:bg-white dark:text-neutral-900"
      >
        {pending ? 'Linking…' : 'Create application'}
      </button>
    </form>
  );
}
