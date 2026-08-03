import { notFound } from 'next/navigation';
import { getJob } from '@/lib/data/jobs';
import { updateJob } from '@/app/actions/jobs';
import { JobForm } from '@/components/jobs/job-form';

export default async function EditJobPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const job = await getJob(id).catch(() => null);
  if (!job) notFound();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight text-ink-900 dark:text-white">Edit job</h1>
        <p className="mt-1 text-sm text-ink-500">Update the listing — changes save once you submit below.</p>
      </div>
      <JobForm action={updateJob.bind(null, id)} initial={job} submitLabel="Save changes" />
    </div>
  );
}
