import { getAnalyticsSummary } from '@/lib/data/analytics';
import { StatTile } from '@/components/analytics/stat-tile';
import { BarList } from '@/components/analytics/bar-list';
import { FunnelChart } from '@/components/analytics/funnel-chart';

export default async function AnalyticsPage() {
  const data = await getAnalyticsSummary();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Analytics</h1>
        <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
          Stage rates are computed from each application's current status (has it ever reached this stage or
          beyond), not a full historical trace.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        <StatTile label="Total applications" value={data.total} />
        <StatTile label="Shortlist rate" value={`${data.rates.shortlist}%`} />
        <StatTile label="Interview rate" value={`${data.rates.interview}%`} />
        <StatTile label="Offer acceptance" value={`${data.rates.offerAcceptance}%`} />
        <StatTile label="Hire rate" value={`${data.rates.hire}%`} />
        <StatTile label="Avg. screening score" value={data.avgScore ?? '—'} />
        <StatTile label="Avg. interview score" value={data.avgInterviewScore ? `${data.avgInterviewScore}/10` : '—'} />
        <StatTile label="Avg. time to hire" value={data.avgTimeToHireDays ? `${data.avgTimeToHireDays}d` : '—'} />
      </div>

      <FunnelChart stages={data.funnel} />

      <div className="grid gap-4 lg:grid-cols-2">
        <BarList
          title="Applications by current status"
          items={data.statusCounts.map((s) => ({ label: s.status.replace(/_/g, ' '), value: s.count }))}
        />
        <BarList
          title="Applications by source"
          items={data.sourceCounts.map((s) => ({ label: s.source.replace(/_/g, ' '), value: s.count }))}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <PerformanceTable
          title="Job performance"
          rows={data.perJob.map((j) => ({ label: j.title, applications: j.applications, hires: j.hires }))}
        />
        <PerformanceTable
          title="Source performance"
          rows={data.perSource.map((s) => ({ label: s.source.replace(/_/g, ' '), applications: s.applications, hires: s.hires }))}
        />
      </div>
    </div>
  );
}

function PerformanceTable({
  title,
  rows,
}: {
  title: string;
  rows: { label: string; applications: number; hires: number }[];
}) {
  return (
    <div className="rounded-lg border border-neutral-200 p-4 dark:border-neutral-800">
      <h3 className="mb-3 text-sm font-semibold">{title}</h3>
      {rows.length === 0 ? (
        <p className="text-sm text-neutral-500 dark:text-neutral-400">No data yet.</p>
      ) : (
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs uppercase text-neutral-500 dark:text-neutral-400">
              <th className="pb-2 font-medium">Name</th>
              <th className="pb-2 font-medium text-right">Applications</th>
              <th className="pb-2 font-medium text-right">Hires</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.label} className="border-t border-neutral-100 dark:border-neutral-800">
                <td className="py-1.5 capitalize">{row.label}</td>
                <td className="py-1.5 text-right tabular-nums">{row.applications}</td>
                <td className="py-1.5 text-right tabular-nums">{row.hires}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
