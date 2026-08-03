import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { createOffer } from '@/app/actions/offers';
import { OfferForm } from '@/components/offers/offer-form';

export default async function NewOfferPage({
  searchParams,
}: {
  searchParams: Promise<{ application?: string }>;
}) {
  const { application: applicationId } = await searchParams;
  if (!applicationId) notFound();

  const supabase = await createClient();
  const { data: application } = await supabase
    .from('applications')
    .select('id, candidate:candidates(full_name), job:jobs(title, employment_type)')
    .eq('id', applicationId)
    .single();

  if (!application) notFound();

  const candidate = application.candidate as unknown as { full_name: string };
  const job = application.job as unknown as { title: string; employment_type: string };

  return (
    <div className="max-w-lg space-y-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Generate offer letter</h1>
        <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
          {candidate.full_name} · {job.title}
        </p>
      </div>
      <OfferForm action={createOffer.bind(null, applicationId)} defaultEmploymentType={job.employment_type} />
    </div>
  );
}
