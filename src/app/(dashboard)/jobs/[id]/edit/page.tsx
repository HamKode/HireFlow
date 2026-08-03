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
      <h1 className="text-xl font-semibold tracking-tight">Edit job</h1>
      <JobForm action={updateJob.bind(null, id)} initial={job} submitLabel="Save changes" />
    </div>
  );
}
