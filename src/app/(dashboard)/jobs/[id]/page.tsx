import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getJob, countApplicationsForJob } from '@/lib/data/jobs';
import { setJobStatus, duplicateJob } from '@/app/actions/jobs';
import { StatusBadge } from '@/components/ui/status-badge';

const actionButtonClass =
  'rounded-md border border-neutral-300 px-3 py-1.5 text-sm font-medium transition hover:bg-neutral-50 dark:border-neutral-700 dark:hover:bg-neutral-900';

export default async function JobDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const job = await getJob(id).catch(() => null);
  if (!job) notFound();

  const applicationCount = await countApplicationsForJob(id);

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-semibold tracking-tight">{job.title}</h1>
            <StatusBadge status={job.status} />
          </div>
          <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
            {[job.department, job.location, job.employment_type.replace('_', ' ')].filter(Boolean).join(' · ')}
          </p>
        </div>
        <Link href={`/jobs/${job.id}/edit`} className={actionButtonClass}>
          Edit
        </Link>
      </div>

      <div className="flex flex-wrap gap-2">
        {job.status !== 'published' && (
          <form action={setJobStatus.bind(null, job.id, 'published')}>
            <button className={actionButtonClass}>Publish</button>
          </form>
        )}
        {job.status === 'published' && (
          <form action={setJobStatus.bind(null, job.id, 'paused')}>
            <button className={actionButtonClass}>Pause</button>
          </form>
        )}
        {job.status !== 'closed' && (
          <form action={setJobStatus.bind(null, job.id, 'closed')}>
            <button className={actionButtonClass}>Close</button>
          </form>
        )}
        <form action={duplicateJob.bind(null, job.id)}>
          <button className={actionButtonClass}>Duplicate</button>
        </form>
        <Link href={`/applications?job=${job.id}`} className={actionButtonClass}>
          View applications ({applicationCount})
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-4 text-sm">
        <Info label="Experience required" value={job.experience_required} />
        <Info label="Education" value={job.education} />
        <Info
          label="Salary range"
          value={
            job.salary_min || job.salary_max
              ? `${job.salary_min ?? '—'} – ${job.salary_max ?? '—'}`
              : null
          }
        />
        <Info label="Positions" value={String(job.positions_count)} />
        <Info label="Application deadline" value={job.application_deadline} />
      </div>

      {job.required_skills.length > 0 && (
        <SkillList label="Required skills" skills={job.required_skills} />
      )}
      {job.preferred_skills.length > 0 && (
        <SkillList label="Preferred skills" skills={job.preferred_skills} />
      )}

      {job.responsibilities && (
        <section>
          <h2 className="mb-1 text-sm font-semibold">Responsibilities</h2>
          <p className="whitespace-pre-line text-sm text-neutral-600 dark:text-neutral-400">
            {job.responsibilities}
          </p>
        </section>
      )}

      {job.description && (
        <section>
          <h2 className="mb-1 text-sm font-semibold">Description</h2>
          <p className="whitespace-pre-line text-sm text-neutral-600 dark:text-neutral-400">{job.description}</p>
        </section>
      )}

      <CriteriaList label="Screening criteria" items={job.screening_criteria as string[] | null} />
      <CriteriaList label="Interview criteria" items={job.interview_criteria as string[] | null} />
    </div>
  );
}

function CriteriaList({ label, items }: { label: string; items: string[] | null }) {
  if (!items || items.length === 0) return null;
  return (
    <section>
      <h2 className="mb-1 text-sm font-semibold">{label}</h2>
      <ul className="list-inside list-disc space-y-0.5 text-sm text-neutral-600 dark:text-neutral-400">
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </section>
  );
}

function Info({ label, value }: { label: string; value: string | null }) {
  if (!value) return null;
  return (
    <div>
      <p className="text-xs font-medium text-neutral-500 dark:text-neutral-400">{label}</p>
      <p>{value}</p>
    </div>
  );
}

function SkillList({ label, skills }: { label: string; skills: string[] }) {
  return (
    <section>
      <h2 className="mb-1.5 text-sm font-semibold">{label}</h2>
      <div className="flex flex-wrap gap-1.5">
        {skills.map((skill) => (
          <span
            key={skill}
            className="rounded-full bg-neutral-100 px-2.5 py-0.5 text-xs text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300"
          >
            {skill}
          </span>
        ))}
      </div>
    </section>
  );
}
