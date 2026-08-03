'use client';

import Link from 'next/link';
import { useActionState } from 'react';
import { ShieldCheck } from 'lucide-react';
import { signup } from '@/app/actions/auth';

export default function SignupPage() {
  const [state, action, pending] = useActionState(signup, undefined);

  return (
    <main className="flex flex-1 bg-background">
      <div className="hidden flex-1 flex-col justify-between bg-linear-to-br from-ink-950 via-brand-900 to-ink-950 p-10 text-white lg:flex">
        <Link href="/" className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-linear-to-br from-brand-400 to-accent-500 font-display text-sm font-extrabold">
            H
          </span>
          <span className="font-display text-base font-bold tracking-tight">
            HireFlow <span className="text-brand-400">AI</span>
          </span>
        </Link>
        <div className="max-w-md space-y-4">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-medium text-brand-200">
            <ShieldCheck className="h-3.5 w-3.5" />
            Fully isolated per company
          </span>
          <h2 className="font-display text-3xl font-bold tracking-tight">Your own private workspace, in seconds.</h2>
          <p className="text-sm leading-relaxed text-ink-300">
            You&apos;ll be the admin of a brand-new organization — your jobs, candidates, and data stay separate from
            every other company on the platform.
          </p>
        </div>
        <p className="text-xs text-ink-400">© {new Date().getFullYear()} HireFlow AI</p>
      </div>

      <div className="flex flex-1 items-center justify-center px-6 py-12">
        <div className="animate-fade-up w-full max-w-sm space-y-7">
          <div className="space-y-1.5">
            <h1 className="font-display text-2xl font-bold tracking-tight text-ink-900 dark:text-white">
              Create your workspace
            </h1>
            <p className="text-sm text-ink-500">Set up your company and get your own admin account.</p>
          </div>

          <form action={action} className="space-y-4">
            <div className="space-y-1.5">
              <label htmlFor="company_name" className="label">
                Company name
              </label>
              <input id="company_name" name="company_name" required placeholder="Acme Inc." className="input" />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="full_name" className="label">
                Your full name
              </label>
              <input id="full_name" name="full_name" required className="input" />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="email" className="label">
                Email
              </label>
              <input id="email" name="email" type="email" required className="input" />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="password" className="label">
                Password
              </label>
              <input id="password" name="password" type="password" minLength={8} required className="input" />
            </div>

            {state?.error && (
              <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-500/10 dark:text-red-300">
                {state.error}
              </p>
            )}

            <button type="submit" disabled={pending} className="btn-primary w-full">
              {pending ? 'Creating account…' : 'Create account'}
            </button>
          </form>

          <p className="text-center text-sm text-ink-500">
            Already have an account?{' '}
            <Link href="/login" className="font-medium text-brand-600 hover:text-brand-700">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
