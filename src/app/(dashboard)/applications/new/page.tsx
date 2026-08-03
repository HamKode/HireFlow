import { createApplication } from '@/app/actions/applications';
import { listCandidateOptions, listJobOptions } from '@/lib/data/applications';
import { NewApplicationForm } from '@/components/applications/new-application-form';

export default async function NewApplicationPage({
  searchParams,
}: {
  searchParams: Promise<{ candidate?: string }>;
}) {
  const params = await searchParams;
  const [candidates, jobs] = await Promise.all([listCandidateOptions(), listJobOptions()]);

  return (
    <div className="max-w-lg space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight text-ink-900 dark:text-white">
          Link candidate to job
        </h1>
        <p className="mt-1 text-sm text-ink-500">Creates a new application entering the pipeline at &quot;Applied&quot;.</p>
      </div>
      <NewApplicationForm action={createApplication} candidates={candidates} jobs={jobs} defaultCandidateId={params.candidate} />
    </div>
  );
}
