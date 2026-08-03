'use client';

import { useActionState } from 'react';
import { updateAppSettings, type SettingsFormState } from '@/app/actions/settings';
import type { AppSettings } from '@/lib/data/settings';

const inputClass = 'input';
const labelClass = 'label';

export function SettingsForm({ settings }: { settings: AppSettings }) {
  const action = updateAppSettings.bind(null, settings.id, settings.organization_id) as (
    state: SettingsFormState,
    formData: FormData
  ) => Promise<SettingsFormState>;
  const [state, formAction, pending] = useActionState(action, undefined);

  return (
    <form action={formAction} className="card max-w-lg space-y-5 p-5 sm:p-6">
      <div className="space-y-1.5">
        <label className={labelClass} htmlFor="company_name">
          Company name
        </label>
        <p className="text-xs text-ink-500">Used on generated offer letters.</p>
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

      <div className="space-y-1.5">
        <label className={labelClass} htmlFor="make_webhook_url">
          Make.com webhook URL
        </label>
        <p className="text-xs text-ink-500">
          Optional — connects your own Make.com scenario for candidate emails and reminders. Leave blank to use
          the platform default.
        </p>
        <input
          id="make_webhook_url"
          name="make_webhook_url"
          placeholder="https://hook.eu1.make.com/..."
          defaultValue={settings.make_webhook_url ?? ''}
          className={inputClass}
        />
      </div>

      <div className="space-y-2">
        <label className={labelClass}>Default candidate scoring weights</label>
        <p className="text-xs text-ink-500">
          Applied to new jobs by default; each job can still override its own weights. Should sum to 100.
        </p>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
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
              <label className="text-xs font-medium text-ink-500" htmlFor={name}>
                {label}
              </label>
              <input id={name} name={name} type="number" defaultValue={value} className={inputClass} />
            </div>
          ))}
        </div>
      </div>

      {state?.error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-500/10 dark:text-red-300">
          {state.error}
        </p>
      )}
      {state?.success && (
        <p className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300">
          Settings saved.
        </p>
      )}

      <button type="submit" disabled={pending} className="btn-primary px-5 py-2.5">
        {pending ? 'Saving…' : 'Save settings'}
      </button>
    </form>
  );
}
