import { getAppSettings } from '@/lib/data/settings';
import { SettingsForm } from '@/components/settings/settings-form';

export default async function SettingsPage() {
  const settings = await getAppSettings();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Settings</h1>
        <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
          AI provider and model selection are managed at the infrastructure level to keep API
          credentials secure. The options below control scoring and interview defaults across
          your recruitment workflow.
        </p>
      </div>
      <SettingsForm settings={settings} />
    </div>
  );
}
