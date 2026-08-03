import { getAppSettings } from '@/lib/data/settings';
import { SettingsForm } from '@/components/settings/settings-form';

export default async function SettingsPage() {
  const settings = await getAppSettings();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Settings</h1>
        <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
          The AI model and temperature are configured via environment variables (
          <code>GROQ_MODEL</code>) — a deliberate choice so changing the model never risks
          exposing an API key through the dashboard.
        </p>
      </div>
      <SettingsForm settings={settings} />
    </div>
  );
}
