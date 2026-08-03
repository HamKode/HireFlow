import Link from 'next/link';
import { ArrowRight, Sparkles, ShieldCheck, Workflow, Users, Briefcase, ScanSearch, CheckCircle2 } from 'lucide-react';

const FEATURES = [
  {
    icon: Sparkles,
    title: 'AI-assisted screening',
    body: 'Resume parsing and scoring in seconds — every score explainable, every decision still yours.',
  },
  {
    icon: Workflow,
    title: 'End-to-end pipeline',
    body: 'From job posting to signed offer to onboarding, one connected workflow instead of five disconnected tools.',
  },
  {
    icon: ShieldCheck,
    title: 'Human-in-the-loop',
    body: 'AI never makes the final call. Scoring, rejections, and offers are always reviewed by your team.',
  },
  {
    icon: Users,
    title: 'Built for every team',
    body: 'Each company gets its own fully isolated workspace — your jobs, candidates, and data, private by default.',
  },
];

const STEPS = [
  {
    icon: Briefcase,
    title: 'Post a role',
    body: 'Write it yourself or let AI draft the description and screening criteria — you review before it goes live.',
  },
  {
    icon: ScanSearch,
    title: 'AI screens every applicant',
    body: 'Resumes are parsed and scored against your criteria the moment someone applies, no manual triage.',
  },
  {
    icon: CheckCircle2,
    title: 'Your team decides',
    body: 'Shortlist, interview, and send offers from one pipeline — the AI informs the call, your team makes it.',
  },
];

export default function HomePage() {
  return (
    <main className="flex flex-1 flex-col bg-background">
      <div className="relative isolate overflow-hidden">
        <div
          className="pointer-events-none absolute inset-x-0 -top-40 -z-10 h-140 bg-[radial-gradient(60%_50%_at_50%_0%,var(--color-brand-100),transparent)] dark:bg-[radial-gradient(60%_50%_at_50%_0%,var(--color-brand-900),transparent)]"
          aria-hidden="true"
        />

        <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-6">
          <span className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-linear-to-br from-brand-500 to-accent-500 font-display text-sm font-extrabold text-white">
              H
            </span>
            <span className="font-display text-base font-bold tracking-tight text-ink-900 dark:text-white">
              HireFlow <span className="text-brand-600">AI</span>
            </span>
          </span>
          <nav className="flex items-center gap-3">
            <Link href="/login" className="btn-ghost text-sm">
              Sign in
            </Link>
            <Link href="/signup" className="btn-primary text-sm">
              Get started
            </Link>
          </nav>
        </header>

        <section className="mx-auto flex w-full max-w-4xl flex-col items-center gap-7 px-6 pb-20 pt-16 text-center sm:pt-24">
          <span className="animate-fade-in inline-flex items-center gap-1.5 rounded-full border border-ink-200 bg-white px-3 py-1 text-xs font-medium text-ink-600 shadow-sm dark:border-white/10 dark:bg-ink-900 dark:text-ink-300">
            <Sparkles className="h-3.5 w-3.5 text-brand-500" />
            AI-powered recruitment, human-approved decisions
          </span>
          <h1 className="animate-fade-up font-display text-4xl font-extrabold tracking-tight text-ink-900 sm:text-6xl dark:text-white">
            Hiring, automated —
            <br />
            <span className="bg-linear-to-r from-brand-600 to-accent-500 bg-clip-text text-transparent">
              without losing the human touch
            </span>
          </h1>
          <p className="animate-fade-up max-w-xl text-balance text-base text-ink-500 sm:text-lg [animation-delay:100ms]">
            HireFlow AI screens resumes, schedules interviews, drafts offers, and tracks onboarding — so your team
            spends time deciding, not searching.
          </p>
          <div className="animate-fade-up flex flex-col gap-3 sm:flex-row [animation-delay:150ms]">
            <Link href="/signup" className="btn-primary px-6 py-3 text-sm">
              Create your workspace
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href="/login" className="btn-secondary px-6 py-3 text-sm">
              Sign in
            </Link>
          </div>
        </section>
      </div>

      <section className="mx-auto w-full max-w-6xl px-6 py-20">
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-wide text-brand-600">How it works</p>
          <h2 className="mt-2 font-display text-2xl font-bold tracking-tight text-ink-900 sm:text-3xl dark:text-white">
            Three steps from job post to hire
          </h2>
        </div>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          {STEPS.map(({ icon: Icon, title, body }, i) => (
            <div key={title} className="relative">
              <div className="flex items-center gap-3">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-linear-to-br from-brand-500 to-accent-500 text-white shadow-[0_6px_16px_-6px_rgba(47,94,255,0.5)]">
                  <Icon className="h-5 w-5" />
                </span>
                <span className="font-display text-3xl font-extrabold text-ink-100 dark:text-white/10">
                  {String(i + 1).padStart(2, '0')}
                </span>
              </div>
              <h3 className="mt-4 font-display text-base font-semibold text-ink-900 dark:text-white">{title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-ink-500">{body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-6 pb-20">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map(({ icon: Icon, title, body }) => (
            <div key={title} className="card p-5 transition-shadow hover:shadow-lg">
              <span className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-500/10">
                <Icon className="h-5 w-5" />
              </span>
              <h3 className="font-display text-sm font-semibold text-ink-900 dark:text-white">{title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-ink-500">{body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="px-6 pb-20">
        <div className="mx-auto flex w-full max-w-4xl flex-col items-center gap-5 rounded-3xl bg-linear-to-br from-ink-950 via-brand-900 to-ink-950 px-8 py-14 text-center text-white sm:py-16">
          <h2 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">Ready to streamline your hiring?</h2>
          <p className="max-w-md text-sm text-ink-300">
            Create your workspace in seconds — free, and fully isolated from every other company on the platform.
          </p>
          <Link href="/signup" className="btn-primary px-6 py-3 text-sm">
            Create your workspace
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      <footer className="border-t border-ink-200/70 dark:border-white/10">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-6 py-10 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2.5">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-linear-to-br from-brand-500 to-accent-500 font-display text-xs font-extrabold text-white">
              H
            </span>
            <div>
              <p className="font-display text-sm font-bold tracking-tight text-ink-900 dark:text-white">
                HireFlow <span className="text-brand-600">AI</span>
              </p>
              <p className="text-xs text-ink-500">AI-assisted recruitment, human-approved decisions.</p>
            </div>
          </div>
          <nav className="flex items-center gap-6 text-sm font-medium text-ink-500">
            <Link href="/login" className="hover:text-ink-900 dark:hover:text-white">
              Sign in
            </Link>
            <Link href="/signup" className="hover:text-ink-900 dark:hover:text-white">
              Create account
            </Link>
          </nav>
        </div>
        <div className="border-t border-ink-200/70 px-6 py-5 text-center text-xs text-ink-400 dark:border-white/10">
          © {new Date().getFullYear()} HireFlow AI. All rights reserved.
        </div>
      </footer>
    </main>
  );
}
