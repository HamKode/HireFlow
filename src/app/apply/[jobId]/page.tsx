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
    <main className="mx-auto max-w-2xl px-6 py-12">
      <div className="mb-8 space-y-2">
        <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">HireFlow AI</p>
        <h1 className="text-2xl font-semibold tracking-tight">{typedJob.title}</h1>
        <p className="text-sm text-neutral-500 dark:text-neutral-400">
          {[typedJob.department, typedJob.location, typedJob.employment_type.replace('_', ' ')]
            .filter(Boolean)
            .join(' · ')}
        </p>
        {typedJob.description && (
          <p className="whitespace-pre-line pt-2 text-sm text-neutral-600 dark:text-neutral-400">
            {typedJob.description}
          </p>
        )}
      </div>

      <ApplyForm jobId={typedJob.id} />
    </main>
  );
}
