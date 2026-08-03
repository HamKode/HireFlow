'use client';

import { useActionState } from 'react';
import { updateAppSettings, type SettingsFormState } from '@/app/actions/settings';
import type { AppSettings } from '@/lib/data/settings';

const inputClass =
  'w-full rounded-md border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-neutral-900 dark:border-neutral-700 dark:bg-neutral-900 dark:focus:border-white';
const labelClass = 'text-sm font-medium';

export function SettingsForm({ settings }: { settings: AppSettings }) {
  const action = updateAppSettings.bind(null, settings.id) as (
    state: SettingsFormState,
    formData: FormData
  ) => Promise<SettingsFormState>;
  const [state, formAction, pending] = useActionState(action, undefined);

  return (
    <form action={formAction} className="max-w-lg space-y-5">
      <div className="space-y-1.5">
        <label className={labelClass} htmlFor="company_name">
          Company name
        </label>
        <p className="text-xs text-neutral-500 dark:text-neutral-400">Used on generated offer letters.</p>
        <input id="company_name" name="company_name" defaultValue={settings.company_name} className={inputClass} />
      </div>

      <div className="space-y-1.5">
        <label className={labelClass} htmlFor="default_interview_duration_minutes">
          Default interview duration (minutes)
        </label>
        <input
          id="default_interview_duration_minutes"
          name="default_interview_duration_minutes"
          type="number"
          defaultValue={settings.default_interview_duration_minutes}
          className={inputClass}
        />
      </div>

      <div className="space-y-2">
        <label className={labelClass}>Default candidate scoring weights</label>
        <p className="text-xs text-neutral-500 dark:text-neutral-400">
          Applied to new jobs by default; each job can still override its own weights. Should sum to 100.
        </p>
        <div className="grid grid-cols-5 gap-2">
          {(
            [
              ['weight_skills', 'Skills', settings.default_scoring_weights.skills],
              ['weight_experience', 'Experience', settings.default_scoring_weights.experience],
              ['weight_technical', 'Technical', settings.default_scoring_weights.technical],
              ['weight_education', 'Education', settings.default_scoring_weights.education],
              ['weight_portfolio', 'Portfolio', settings.default_scoring_weights.portfolio],
            ] as const
          ).map(([name, label, value]) => (
            <div key={name} className="space-y-1">
              <label className="text-xs text-neutral-500 dark:text-neutral-400" htmlFor={name}>
                {label}
              </label>
              <input id={name} name={name} type="number" defaultValue={value} className={inputClass} />
            </div>
          ))}
        </div>
      </div>

      {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
      {state?.success && <p className="text-sm text-emerald-600">Settings saved.</p>}

      <button
        type="submit"
        disabled={pending}
        className="rounded-md bg-neutral-900 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-neutral-700 disabled:opacity-50 dark:bg-white dark:text-neutral-900"
      >
        {pending ? 'Saving…' : 'Save settings'}
      </button>
    </form>
  );
}
