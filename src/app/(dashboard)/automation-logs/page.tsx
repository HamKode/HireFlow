import { createClient } from '@/lib/supabase/server';

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
        <h1 className="text-xl font-semibold tracking-tight">Automation Logs</h1>
        <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
          Audit trail of dashboard actions and (from Phase 4 onward) Make.com automation events.
        </p>
      </div>

      <div className="overflow-hidden rounded-lg border border-neutral-200 dark:border-neutral-800">
        <table className="w-full text-sm">
          <thead className="bg-neutral-50 text-left text-xs uppercase text-neutral-500 dark:bg-neutral-900 dark:text-neutral-400">
            <tr>
              <th className="px-4 py-3 font-medium">Action</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Source</th>
              <th className="px-4 py-3 font-medium">When</th>
            </tr>
          </thead>
          <tbody>
            {(logs ?? []).map((log) => (
              <tr key={log.id} className="border-t border-neutral-100 dark:border-neutral-800">
                <td className="px-4 py-3 font-medium">{log.action}</td>
                <td className="px-4 py-3">
                  <span
                    className={
                      log.status === 'success'
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : log.status === 'failure'
                          ? 'text-red-600 dark:text-red-400'
                          : 'text-amber-600 dark:text-amber-400'
                    }
                  >
                    {log.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-neutral-500 dark:text-neutral-400">{log.source}</td>
                <td className="px-4 py-3 text-neutral-500 dark:text-neutral-400">
                  {new Date(log.created_at).toLocaleString()}
                </td>
              </tr>
            ))}
            {(!logs || logs.length === 0) && (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-neutral-500 dark:text-neutral-400">
                  No automation events logged yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
