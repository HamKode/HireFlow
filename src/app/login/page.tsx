'use client';

import Link from 'next/link';
import { useActionState } from 'react';
import { Sparkles } from 'lucide-react';
import { login } from '@/app/actions/auth';

export default function LoginPage() {
  const [state, action, pending] = useActionState(login, undefined);

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
            <Sparkles className="h-3.5 w-3.5" />
            Human-in-the-loop hiring
          </span>
          <h2 className="font-display text-3xl font-bold tracking-tight">Welcome back to your recruitment pipeline.</h2>
          <p className="text-sm leading-relaxed text-ink-300">
            Pick up right where you left off — screening, interviews, offers, and onboarding, all in one place.
          </p>
        </div>
        <p className="text-xs text-ink-400">© {new Date().getFullYear()} HireFlow AI</p>
      </div>

      <div className="flex flex-1 items-center justify-center px-6 py-12">
        <div className="animate-fade-up w-full max-w-sm space-y-7">
          <div className="space-y-1.5">
            <h1 className="font-display text-2xl font-bold tracking-tight text-ink-900 dark:text-white">Sign in</h1>
            <p className="text-sm text-ink-500">Welcome back — enter your details to access your workspace.</p>
          </div>

          <form action={action} className="space-y-4">
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
              <input id="password" name="password" type="password" required className="input" />
            </div>

            {state?.error && (
              <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-500/10 dark:text-red-300">
                {state.error}
              </p>
            )}

            <button type="submit" disabled={pending} className="btn-primary w-full">
              {pending ? 'Signing in…' : 'Sign in'}
            </button>
          </form>

          <p className="text-center text-sm text-ink-500">
            No account?{' '}
            <Link href="/signup" className="font-medium text-brand-600 hover:text-brand-700">
              Create one
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
