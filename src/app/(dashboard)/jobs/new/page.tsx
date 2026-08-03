import { createJob } from '@/app/actions/jobs';
import { JobForm } from '@/components/jobs/job-form';

export default function NewJobPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight text-ink-900 dark:text-white">New job</h1>
        <p className="mt-1 text-sm text-ink-500">Fill in the details below, or draft the copy with AI.</p>
      </div>
      <JobForm action={createJob} submitLabel="Create job" />
    </div>
  );
}
