'use client';

import { useActionState, useState } from 'react';
import { Sparkles } from 'lucide-react';
import type { Job } from '@/lib/supabase/types';
import type { JobFormState } from '@/app/actions/jobs';
import type { JobDescriptionResult } from '@/lib/ai/schemas';

const inputClass = 'input';
const labelClass = 'label';

function listToLines(list?: string[] | null) {
  return list?.join('\n') ?? '';
}

export function JobForm({
  action,
  initial,
  submitLabel,
}: {
  action: (state: JobFormState, formData: FormData) => Promise<JobFormState>;
  initial?: Job;
  submitLabel: string;
}) {
  const [state, formAction, pending] = useActionState(action, undefined);

  // Fields the AI generator can fill are controlled state; everything else
  // stays uncontrolled (defaultValue) since it's never touched by generation.
  const [title, setTitle] = useState(initial?.title ?? '');
  const [department, setDepartment] = useState(initial?.department ?? '');
  const [employmentType, setEmploymentType] = useState(initial?.employment_type ?? 'full_time');
  const [experienceRequired, setExperienceRequired] = useState(initial?.experience_required ?? '');
  const [requiredSkills, setRequiredSkills] = useState(initial?.required_skills?.join(', ') ?? '');
  const [preferredSkills, setPreferredSkills] = useState(initial?.preferred_skills?.join(', ') ?? '');
  const [responsibilities, setResponsibilities] = useState(initial?.responsibilities ?? '');
  const [description, setDescription] = useState(initial?.description ?? '');
  const [screeningCriteria, setScreeningCriteria] = useState(
    listToLines(initial?.screening_criteria as string[] | undefined)
  );
  const [interviewCriteria, setInterviewCriteria] = useState(
    listToLines(initial?.interview_criteria as string[] | undefined)
  );

  const [generating, setGenerating] = useState(false);
  const [generateError, setGenerateError] = useState<string | null>(null);

  async function handleGenerate() {
    if (!title.trim()) {
      setGenerateError('Enter a job title first.');
      return;
    }
    setGenerating(true);
    setGenerateError(null);
    try {
      const res = await fetch('/api/ai/job-description', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          department,
          employment_type: employmentType,
          experience_required: experienceRequired,
          required_skills: requiredSkills.split(',').map((s) => s.trim()).filter(Boolean),
          preferred_skills: preferredSkills.split(',').map((s) => s.trim()).filter(Boolean),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setGenerateError(data.error ?? 'Generation failed.');
        return;
      }
      const result = data.result as JobDescriptionResult;
      setDescription(result.description);
      setResponsibilities(result.responsibilities);
      setRequiredSkills(result.required_skills.join(', '));
      setPreferredSkills(result.preferred_skills.join(', '));
      setScreeningCriteria(result.screening_criteria.join('\n'));
      setInterviewCriteria(result.interview_criteria.join('\n'));
    } catch {
      setGenerateError('Generation failed. Check your connection and try again.');
    } finally {
      setGenerating(false);
    }
  }

  return (
    <form action={formAction} className="max-w-2xl space-y-5">
      <div className="card space-y-5 p-5 sm:p-6">
        <div className="space-y-1.5">
          <label className={labelClass} htmlFor="title">
            Job title *
          </label>
          <input
            id="title"
            name="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className={inputClass}
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <label className={labelClass} htmlFor="department">
              Department
            </label>
            <input
              id="department"
              name="department"
              value={department ?? ''}
              onChange={(e) => setDepartment(e.target.value)}
              className={inputClass}
            />
          </div>
          <div className="space-y-1.5">
            <label className={labelClass} htmlFor="location">
              Location
            </label>
            <input id="location" name="location" defaultValue={initial?.location ?? ''} className={inputClass} />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <label className={labelClass} htmlFor="employment_type">
              Employment type
            </label>
            <select
              id="employment_type"
              name="employment_type"
              value={employmentType}
              onChange={(e) => setEmploymentType(e.target.value as typeof employmentType)}
              className={inputClass}
            >
              <option value="full_time">Full-time</option>
              <option value="part_time">Part-time</option>
              <option value="contract">Contract</option>
              <option value="internship">Internship</option>
              <option value="temporary">Temporary</option>
            </select>
          </div>
          <div className="space-y-1.5">
            <label className={labelClass} htmlFor="positions_count">
              Number of positions
            </label>
            <input
              id="positions_count"
              name="positions_count"
              type="number"
              min={1}
              defaultValue={initial?.positions_count ?? 1}
              className={inputClass}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <label className={labelClass} htmlFor="salary_min">
              Salary min
            </label>
            <input
              id="salary_min"
              name="salary_min"
              type="number"
              defaultValue={initial?.salary_min ?? ''}
              className={inputClass}
            />
          </div>
          <div className="space-y-1.5">
            <label className={labelClass} htmlFor="salary_max">
              Salary max
            </label>
            <input
              id="salary_max"
              name="salary_max"
              type="number"
              defaultValue={initial?.salary_max ?? ''}
              className={inputClass}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <label className={labelClass} htmlFor="experience_required">
              Experience required
            </label>
            <input
              id="experience_required"
              name="experience_required"
              placeholder="e.g. 2+ years"
              value={experienceRequired ?? ''}
              onChange={(e) => setExperienceRequired(e.target.value)}
              className={inputClass}
            />
          </div>
          <div className="space-y-1.5">
            <label className={labelClass} htmlFor="education">
              Education
            </label>
            <input id="education" name="education" defaultValue={initial?.education ?? ''} className={inputClass} />
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-dashed border-brand-300 bg-brand-50/50 p-4 dark:border-brand-500/30 dark:bg-brand-500/5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="flex items-center gap-1.5 text-sm font-medium text-ink-900 dark:text-white">
            <Sparkles className="h-4 w-4 text-brand-500" />
            Generate with AI
          </p>
          <button type="button" onClick={handleGenerate} disabled={generating} className="btn-primary text-xs">
            {generating ? 'Generating…' : 'Generate description & criteria'}
          </button>
        </div>
        <p className="mt-1.5 text-xs text-ink-500">
          Uses the title, department, employment type, experience, and skills above. Review and edit everything
          below before saving — nothing is published automatically.
        </p>
        {generateError && <p className="mt-2 text-xs text-red-600">{generateError}</p>}
      </div>

      <div className="card space-y-5 p-5 sm:p-6">
      <div className="space-y-1.5">
        <label className={labelClass} htmlFor="required_skills">
          Required skills (comma separated)
        </label>
        <input
          id="required_skills"
          name="required_skills"
          value={requiredSkills}
          onChange={(e) => setRequiredSkills(e.target.value)}
          className={inputClass}
        />
      </div>
      <div className="space-y-1.5">
        <label className={labelClass} htmlFor="preferred_skills">
          Preferred skills (comma separated)
        </label>
        <input
          id="preferred_skills"
          name="preferred_skills"
          value={preferredSkills}
          onChange={(e) => setPreferredSkills(e.target.value)}
          className={inputClass}
        />
      </div>

      <div className="space-y-1.5">
        <label className={labelClass} htmlFor="responsibilities">
          Responsibilities
        </label>
        <textarea
          id="responsibilities"
          name="responsibilities"
          rows={4}
          value={responsibilities ?? ''}
          onChange={(e) => setResponsibilities(e.target.value)}
          className={inputClass}
        />
      </div>

      <div className="space-y-1.5">
        <label className={labelClass} htmlFor="description">
          Job description
        </label>
        <textarea
          id="description"
          name="description"
          rows={6}
          value={description ?? ''}
          onChange={(e) => setDescription(e.target.value)}
          className={inputClass}
          placeholder="Write manually, or generate one with AI above."
        />
      </div>

      <div className="space-y-1.5">
        <label className={labelClass} htmlFor="screening_criteria">
          Screening criteria (one per line)
        </label>
        <textarea
          id="screening_criteria"
          name="screening_criteria"
          rows={3}
          value={screeningCriteria}
          onChange={(e) => setScreeningCriteria(e.target.value)}
          className={inputClass}
        />
      </div>
      <div className="space-y-1.5">
        <label className={labelClass} htmlFor="interview_criteria">
          Interview criteria (one per line)
        </label>
        <textarea
          id="interview_criteria"
          name="interview_criteria"
          rows={3}
          value={interviewCriteria}
          onChange={(e) => setInterviewCriteria(e.target.value)}
          className={inputClass}
        />
      </div>

      <div className="space-y-1.5">
        <label className={labelClass} htmlFor="application_deadline">
          Application deadline
        </label>
        <input
          id="application_deadline"
          name="application_deadline"
          type="date"
          defaultValue={initial?.application_deadline ?? ''}
          className={inputClass}
        />
      </div>
      </div>

      {state?.error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-500/10 dark:text-red-300">
          {state.error}
        </p>
      )}

      <button type="submit" disabled={pending} className="btn-primary px-5 py-2.5">
        {pending ? 'Saving…' : submitLabel}
      </button>
    </form>
  );
}
