import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { listInterviewerOptions } from '@/lib/data/interviews';
import { getAppSettings } from '@/lib/data/settings';
import { scheduleInterview } from '@/app/actions/interviews';
import { ScheduleInterviewForm } from '@/components/interviews/schedule-form';

export default async function NewInterviewPage({
  searchParams,
}: {
  searchParams: Promise<{ application?: string }>;
}) {
  const { application: applicationId } = await searchParams;
  if (!applicationId) notFound();

  const supabase = await createClient();
  const { data: application } = await supabase
    .from('applications')
    .select('id, candidate:candidates(full_name), job:jobs(title)')
    .eq('id', applicationId)
    .single();

  if (!application) notFound();

  const candidate = application.candidate as unknown as { full_name: string };
  const job = application.job as unknown as { title: string };
  const [interviewers, settings] = await Promise.all([listInterviewerOptions(), getAppSettings()]);

  return (
    <div className="max-w-lg space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight text-ink-900 dark:text-white">
          Schedule interview
        </h1>
        <p className="mt-1 text-sm text-ink-500">
          {candidate.full_name} · {job.title}
        </p>
      </div>
      <ScheduleInterviewForm
        action={scheduleInterview.bind(null, applicationId)}
        interviewers={interviewers}
        defaultDurationMinutes={settings.default_interview_duration_minutes}
      />
    </div>
  );
}
