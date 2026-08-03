import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Pencil } from 'lucide-react';
import { getJob, countApplicationsForJob } from '@/lib/data/jobs';
import { setJobStatus, duplicateJob } from '@/app/actions/jobs';
import { StatusBadge } from '@/components/ui/status-badge';
import { CopyApplyLink } from '@/components/jobs/copy-apply-link';

export default async function JobDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const job = await getJob(id).catch(() => null);
  if (!job) notFound();

  const applicationCount = await countApplicationsForJob(id);

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="font-display text-2xl font-bold tracking-tight text-ink-900 dark:text-white">
              {job.title}
            </h1>
            <StatusBadge status={job.status} />
          </div>
          <p className="mt-1 text-sm text-ink-500">
            {[job.department, job.location, job.employment_type.replace('_', ' ')].filter(Boolean).join(' · ')}
          </p>
        </div>
        <Link href={`/jobs/${job.id}/edit`} className="btn-secondary">
          <Pencil className="h-3.5 w-3.5" />
          Edit
        </Link>
      </div>

      <div className="flex flex-wrap gap-2">
        {job.status !== 'published' && (
          <form action={setJobStatus.bind(null, job.id, 'published')}>
            <button className="btn-secondary">Publish</button>
          </form>
        )}
        {job.status === 'published' && (
          <form action={setJobStatus.bind(null, job.id, 'paused')}>
            <button className="btn-secondary">Pause</button>
          </form>
        )}
        {job.status !== 'closed' && (
          <form action={setJobStatus.bind(null, job.id, 'closed')}>
            <button className="btn-secondary">Close</button>
          </form>
        )}
        <form action={duplicateJob.bind(null, job.id)}>
          <button className="btn-secondary">Duplicate</button>
        </form>
        <Link href={`/applications?job=${job.id}`} className="btn-secondary">
          View applications ({applicationCount})
        </Link>
        {job.status === 'published' && <CopyApplyLink jobId={job.id} />}
      </div>

      <div className="card grid grid-cols-1 gap-4 p-5 text-sm sm:grid-cols-2">
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
        <section className="card p-5">
          <h2 className="mb-1.5 text-sm font-semibold text-ink-900 dark:text-white">Responsibilities</h2>
          <p className="whitespace-pre-line text-sm leading-relaxed text-ink-600 dark:text-ink-300">
            {job.responsibilities}
          </p>
        </section>
      )}

      {job.description && (
        <section className="card p-5">
          <h2 className="mb-1.5 text-sm font-semibold text-ink-900 dark:text-white">Description</h2>
          <p className="whitespace-pre-line text-sm leading-relaxed text-ink-600 dark:text-ink-300">
            {job.description}
          </p>
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
    <section className="card p-5">
      <h2 className="mb-1.5 text-sm font-semibold text-ink-900 dark:text-white">{label}</h2>
      <ul className="list-inside list-disc space-y-0.5 text-sm text-ink-600 dark:text-ink-300">
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
      <p className="text-xs font-medium text-ink-500">{label}</p>
      <p className="text-ink-900 dark:text-white">{value}</p>
    </div>
  );
}

function SkillList({ label, skills }: { label: string; skills: string[] }) {
  return (
    <section>
      <h2 className="mb-1.5 text-sm font-semibold text-ink-900 dark:text-white">{label}</h2>
      <div className="flex flex-wrap gap-1.5">
        {skills.map((skill) => (
          <span
            key={skill}
            className="rounded-full bg-ink-100 px-2.5 py-1 text-xs font-medium text-ink-700 dark:bg-white/5 dark:text-ink-300"
          >
            {skill}
          </span>
        ))}
      </div>
    </section>
  );
}
