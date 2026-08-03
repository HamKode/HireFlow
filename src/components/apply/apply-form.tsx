'use client';

import { useState, type FormEvent } from 'react';
import { CheckCircle2, UploadCloud } from 'lucide-react';

const inputClass = 'input';
const labelClass = 'label';

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
      <div className="card animate-scale-in flex flex-col items-center p-8 text-center">
        <span className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400">
          <CheckCircle2 className="h-6 w-6" />
        </span>
        <h2 className="font-display text-lg font-bold text-ink-900 dark:text-white">
          {result.alreadyApplied ? "You've already applied" : 'Application received'}
        </h2>
        <p className="mt-1.5 text-sm text-ink-500">
          {result.alreadyApplied
            ? 'We found an existing application from you for this role — no need to submit again.'
            : "Thanks for applying. Our team will review your application and be in touch."}
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="card space-y-4 p-5 sm:p-6" encType="multipart/form-data">
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

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
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
        <div className="relative">
          <input
            id="resume"
            name="resume"
            type="file"
            accept=".pdf,.docx,.txt"
            className="input cursor-pointer file:mr-3 file:cursor-pointer file:rounded-lg file:border-0 file:bg-brand-50 file:px-3 file:py-1.5 file:text-xs file:font-medium file:text-brand-700 dark:file:bg-brand-500/10 dark:file:text-brand-300"
          />
          <UploadCloud className="pointer-events-none absolute right-3 top-1/2 hidden h-4 w-4 -translate-y-1/2 text-ink-400 sm:block" />
        </div>
      </div>

      <div className="space-y-1.5">
        <label className={labelClass} htmlFor="cover_letter">
          Cover letter
        </label>
        <textarea id="cover_letter" name="cover_letter" rows={4} className={inputClass} />
      </div>

      {error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-500/10 dark:text-red-300">
          {error}
        </p>
      )}

      <button type="submit" disabled={submitting} className="btn-primary w-full py-2.5">
        {submitting ? 'Submitting…' : 'Submit application'}
      </button>
    </form>
  );
}
