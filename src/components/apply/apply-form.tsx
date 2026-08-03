'use client';

import { useState, type FormEvent } from 'react';

const inputClass =
  'w-full rounded-md border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-neutral-900 dark:border-neutral-700 dark:bg-neutral-900 dark:focus:border-white';
const labelClass = 'text-sm font-medium';

export function ApplyForm({ jobId }: { jobId: string }) {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{ alreadyApplied: boolean } | null>(null);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    formData.set('job_id', jobId);

    try {
      const res = await fetch('/api/public/apply', { method: 'POST', body: formData });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? 'Something went wrong. Please try again.');
        return;
      }
      setResult({ alreadyApplied: data.alreadyApplied });
    } catch {
      setError('Something went wrong. Please check your connection and try again.');
    } finally {
      setSubmitting(false);
    }
  }

  if (result) {
    return (
      <div className="rounded-lg border border-neutral-200 p-6 text-center dark:border-neutral-800">
        <h2 className="text-lg font-semibold">{result.alreadyApplied ? "You've already applied" : 'Application received'}</h2>
        <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
          {result.alreadyApplied
            ? 'We found an existing application from you for this role — no need to submit again.'
            : "Thanks for applying. Our team will review your application and be in touch."}
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4" encType="multipart/form-data">
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

      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-1.5">
          <label className={labelClass} htmlFor="years_experience">
            Years of experience
          </label>
          <input id="years_experience" name="years_experience" type="number" step="0.5" className={inputClass} />
        </div>
        <div className="space-y-1.5">
          <label className={labelClass} htmlFor="expected_salary">
            Expected salary
          </label>
          <input id="expected_salary" name="expected_salary" type="number" className={inputClass} />
        </div>
        <div className="space-y-1.5">
          <label className={labelClass} htmlFor="notice_period">
            Notice period
          </label>
          <input id="notice_period" name="notice_period" placeholder="e.g. 2 weeks" className={inputClass} />
        </div>
      </div>

      <div className="space-y-1.5">
        <label className={labelClass} htmlFor="source">
          How did you hear about this role?
        </label>
        <select id="source" name="source" defaultValue="company_website" className={inputClass}>
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

      <div className="space-y-1.5">
        <label className={labelClass} htmlFor="resume">
          Resume (PDF, DOCX, or TXT)
        </label>
        <input id="resume" name="resume" type="file" accept=".pdf,.docx,.txt" className={inputClass} />
      </div>

      <div className="space-y-1.5">
        <label className={labelClass} htmlFor="cover_letter">
          Cover letter
        </label>
        <textarea id="cover_letter" name="cover_letter" rows={4} className={inputClass} />
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={submitting}
        className="w-full rounded-md bg-neutral-900 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-neutral-700 disabled:opacity-50 dark:bg-white dark:text-neutral-900"
      >
        {submitting ? 'Submitting…' : 'Submit application'}
      </button>
    </form>
  );
}
