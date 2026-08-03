import { notFound } from 'next/navigation';
import { createServiceRoleClient } from '@/lib/supabase/server';
import { ApplyForm } from '@/components/apply/apply-form';
import type { Job } from '@/lib/supabase/types';

export default async function ApplyPage({ params }: { params: Promise<{ jobId: string }> }) {
  const { jobId } = await params;

  const supabase = createServiceRoleClient();
  const { data: job } = await supabase.from('jobs').select('*').eq('id', jobId).single();

  if (!job || (job as Job).status !== 'published') notFound();
  const typedJob = job as Job;

  return (
    <main className="min-h-full flex-1 bg-background">
      <div className="border-b border-ink-200/70 bg-linear-to-b from-brand-50/60 to-transparent dark:border-white/10 dark:from-brand-500/5">
        <div className="mx-auto max-w-2xl px-6 py-12">
          <span className="mb-4 inline-flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-linear-to-br from-brand-500 to-accent-500 font-display text-xs font-extrabold text-white">
              H
            </span>
            <span className="font-display text-sm font-bold tracking-tight text-ink-900 dark:text-white">
              HireFlow <span className="text-brand-600">AI</span>
            </span>
          </span>
          <h1 className="animate-fade-up font-display text-3xl font-bold tracking-tight text-ink-900 dark:text-white">
            {typedJob.title}
          </h1>
          <p className="mt-2 text-sm text-ink-500">
            {[typedJob.department, typedJob.location, typedJob.employment_type.replace('_', ' ')]
              .filter(Boolean)
              .join(' · ')}
          </p>
          {typedJob.description && (
            <p className="mt-4 whitespace-pre-line text-sm leading-relaxed text-ink-600 dark:text-ink-300">
              {typedJob.description}
            </p>
          )}
        </div>
      </div>

      <div className="mx-auto max-w-2xl px-6 py-10">
        <ApplyForm jobId={typedJob.id} />
      </div>
    </main>
  );
}
