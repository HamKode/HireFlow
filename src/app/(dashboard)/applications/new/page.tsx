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
      <h1 className="text-xl font-semibold tracking-tight">Link candidate to job</h1>
      <NewApplicationForm action={createApplication} candidates={candidates} jobs={jobs} defaultCandidateId={params.candidate} />
    </div>
  );
}
