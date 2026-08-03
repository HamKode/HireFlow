import { createJob } from '@/app/actions/jobs';
import { JobForm } from '@/components/jobs/job-form';

export default function NewJobPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold tracking-tight">New job</h1>
      <JobForm action={createJob} submitLabel="Create job" />
    </div>
  );
}
