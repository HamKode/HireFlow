import { createClient } from '@/lib/supabase/server';

const STATUS_STYLES: Record<string, string> = {
  success: 'text-emerald-600 dark:text-emerald-400',
  failure: 'text-red-600 dark:text-red-400',
};

export default async function AutomationLogsPage() {
  const supabase = await createClient();
  const { data: logs } = await supabase
    .from('automation_logs')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(100);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight text-ink-900 dark:text-white">
          Automation Logs
        </h1>
        <p className="mt-1 text-sm text-ink-500">
          Audit trail of every dashboard action, AI operation, and Make.com automation event.
        </p>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-ink-50 text-left text-xs font-medium uppercase tracking-wide text-ink-500 dark:bg-white/5">
              <tr>
                <th className="px-4 py-3">Action</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Source</th>
                <th className="px-4 py-3">When</th>
              </tr>
            </thead>
            <tbody>
              {(logs ?? []).map((log) => (
                <tr key={log.id} className="border-t border-ink-100 dark:border-white/10">
                  <td className="px-4 py-3 font-medium text-ink-900 dark:text-white">{log.action}</td>
                  <td className="px-4 py-3">
                    <span className={`font-medium ${STATUS_STYLES[log.status] ?? 'text-amber-600 dark:text-amber-400'}`}>
                      {log.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-ink-500">{log.source}</td>
                  <td className="px-4 py-3 text-ink-500">{new Date(log.created_at).toLocaleString()}</td>
                </tr>
              ))}
              {(!logs || logs.length === 0) && (
                <tr>
                  <td colSpan={4} className="px-4 py-10 text-center text-sm text-ink-400">
                    No automation events logged yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
